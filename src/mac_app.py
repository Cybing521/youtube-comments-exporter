import os
import sys
from pathlib import Path
from typing import List, Optional

from PySide6.QtCore import (
    QEasingCurve,
    QParallelAnimationGroup,
    QPropertyAnimation,
    QThread,
    QTimer,
    Qt,
    Signal,
)
from PySide6.QtGui import QColor, QFont
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QFileDialog,
    QFrame,
    QGraphicsDropShadowEffect,
    QGraphicsOpacityEffect,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QPushButton,
    QPlainTextEdit,
    QScrollArea,
    QVBoxLayout,
    QSpacerItem,
    QSizePolicy,
    QWidget,
)

from src.youtube_comments_api import export_all_artifacts, write_flat_excel_from_json


class ExportWorker(QThread):
    success = Signal(dict)
    error = Signal(str)

    def __init__(self, mode: str, payload: dict):
        super().__init__()
        self.mode = mode
        self.payload = payload

    def run(self) -> None:
        try:
            if self.mode == "export_all":
                result = export_all_artifacts(
                    api_key=self.payload["api_key"],
                    url_or_video_id=self.payload["url"],
                    output_dir=Path(self.payload["output_dir"]),
                    order=self.payload["order"],
                )
            else:
                json_path = Path(self.payload["json_path"])
                output_dir = Path(self.payload["output_dir"])
                output_dir.mkdir(parents=True, exist_ok=True)
                flat_path = output_dir / f"{json_path.stem}.flat.xlsx"
                write_flat_excel_from_json(json_path, flat_path)
                result = {
                    "video_id": json_path.stem,
                    "order": "json-only",
                    "summary": {},
                    "paths": {
                        "json": str(json_path),
                        "flat_excel": str(flat_path),
                    },
                }
            self.success.emit(result)
        except Exception as exc:  # pragma: no cover - exercised in UI usage
            self.error.emit(str(exc))


class GlassPanel(QFrame):
    def __init__(self, object_name: str = "glassPanel"):
        super().__init__()
        self.setObjectName(object_name)
        self.setFrameShape(QFrame.NoFrame)


class AnimatedButton(QPushButton):
    def __init__(self, text: str):
        super().__init__(text)
        self.setCursor(Qt.PointingHandCursor)
        self._shadow = QGraphicsDropShadowEffect(self)
        self._shadow.setBlurRadius(18)
        self._shadow.setOffset(0, 8)
        self._shadow.setColor(QColor(78, 107, 145, 28))
        self.setGraphicsEffect(self._shadow)
        self._shadow_animation = QPropertyAnimation(self._shadow, b"blurRadius", self)
        self._shadow_animation.setDuration(180)
        self._shadow_animation.setEasingCurve(QEasingCurve.OutCubic)

    def enterEvent(self, event) -> None:  # pragma: no cover - UI behavior
        self._animate_shadow(28)
        super().enterEvent(event)

    def leaveEvent(self, event) -> None:  # pragma: no cover - UI behavior
        self._animate_shadow(18)
        super().leaveEvent(event)

    def _animate_shadow(self, blur_radius: float) -> None:
        self._shadow_animation.stop()
        self._shadow_animation.setStartValue(self._shadow.blurRadius())
        self._shadow_animation.setEndValue(blur_radius)
        self._shadow_animation.start()


class MacExporterWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.worker = None
        self.entry_animations: List[QPropertyAnimation] = []
        self._intro_played = False
        self.setWindowTitle("YouTube 评论导出器")
        self.resize(1120, 1020)
        self.setMinimumSize(980, 900)
        self._build_ui()
        self._apply_style()

    def _build_ui(self) -> None:
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.setCentralWidget(scroll)

        outer = QWidget()
        scroll.setWidget(outer)

        shell = QVBoxLayout(outer)
        shell.setContentsMargins(30, 26, 30, 28)
        shell.setSpacing(22)

        hero = GlassPanel("heroPanel")
        self.hero_panel = hero
        hero_layout = QVBoxLayout(hero)
        hero_layout.setContentsMargins(30, 28, 30, 28)
        hero_layout.setSpacing(10)

        eyebrow = QLabel("为 mac 用户准备")
        eyebrow.setObjectName("eyebrow")
        title = QLabel("把评论导成真正能交付的表格")
        title.setObjectName("title")
        subtitle = QLabel(
            "把 YouTube 链接交给这个窗口，它会输出 JSON、分层 Excel 和扁平 Excel。整个过程保持中文、单窗口、零终端，适合直接交给非技术同事使用。"
        )
        subtitle.setWordWrap(True)
        subtitle.setObjectName("subtitle")

        self.status_chip = QLabel("就绪")
        self.status_chip.setObjectName("statusChip")
        self.status_chip.setAlignment(Qt.AlignCenter)
        self.status_chip.setFixedWidth(132)

        hero_top = QHBoxLayout()
        hero_top.addWidget(eyebrow)
        hero_top.addStretch(1)
        hero_top.addWidget(self.status_chip)

        hero_layout.addLayout(hero_top)
        hero_layout.addWidget(title)
        hero_layout.addWidget(subtitle)
        shell.addWidget(hero)

        form_panel = GlassPanel("formPanel")
        self.form_panel = form_panel
        form_panel.setMinimumHeight(520)
        form_layout = QVBoxLayout(form_panel)
        form_layout.setContentsMargins(28, 26, 28, 24)
        form_layout.setSpacing(16)

        form_intro = QLabel("主流程")
        form_intro.setObjectName("sectionTitle")
        form_blurb = QLabel("把必要信息填在这里，主按钮负责一键导出全部结果。")
        form_blurb.setWordWrap(True)
        form_blurb.setObjectName("sectionNote")

        self.url_input = self._line_edit("粘贴 YouTube 视频链接")
        self.api_key_input = self._line_edit("粘贴 YouTube Data API 密钥")
        self.api_key_input.setEchoMode(QLineEdit.PasswordEchoOnEdit)
        self.output_dir_input = self._line_edit("选择导出文件夹")
        self.json_input = self._line_edit("可选：选择已有导出 JSON")
        self.order_input = QComboBox()
        self.order_input.addItem("最新优先（推荐）", "time")
        self.order_input.addItem("相关性优先", "relevance")
        self.order_input.setMinimumHeight(56)
        self.order_input.setFixedWidth(240)

        browse_output = self._secondary_button("选择文件夹")
        browse_output.clicked.connect(self.choose_output_folder)
        output_row = QHBoxLayout()
        output_row.setSpacing(12)
        output_row.addWidget(self.output_dir_input, 1)
        output_row.addWidget(browse_output)

        form_layout.addWidget(form_intro)
        form_layout.addWidget(form_blurb)
        self._add_form_row(
            form_layout,
            "YouTube 链接",
            "支持完整链接和短链接，直接粘贴即可。",
            self.url_input,
        )
        self._add_form_row(
            form_layout,
            "API 密钥",
            "只用于官方接口抓取；之后你可以随时替换。",
            self.api_key_input,
        )
        self._add_form_row(
            form_layout,
            "导出文件夹",
            "建议为每个视频单独放一个文件夹，后续更好管理。",
            output_row,
        )
        self._add_form_row(
            form_layout,
            "排序方式",
            "如果你想尽量贴近页面评论总量，优先选择“最新优先”。",
            self.order_input,
        )
        form_layout.addSpacerItem(QSpacerItem(0, 0, QSizePolicy.Minimum, QSizePolicy.Expanding))

        shell.addWidget(form_panel)

        actions_panel = GlassPanel("actionsPanel")
        self.actions_panel = actions_panel
        actions_layout = QVBoxLayout(actions_panel)
        actions_layout.setContentsMargins(24, 20, 24, 20)
        actions_layout.setSpacing(14)
        actions_head = QLabel("快捷操作")
        actions_head.setObjectName("sectionTitle")
        actions_note = QLabel("主按钮会导出完整结果；如果你手上已经有 JSON，就直接用右侧按钮重新生成扁平 Excel。")
        actions_note.setObjectName("sectionNote")
        actions_note.setWordWrap(True)
        self.json_hint = QLabel("还没有选择现成 JSON。点击右侧按钮时会自动弹出文件选择器。")
        self.json_hint.setObjectName("inlineNote")
        self.json_hint.setWordWrap(True)
        actions_layout.addWidget(actions_head)
        actions_layout.addWidget(actions_note)
        actions_layout.addWidget(self.json_hint)

        actions = QHBoxLayout()
        actions.setSpacing(14)
        self.export_button = self._primary_button("导出全部")
        self.export_button.clicked.connect(self.export_all)
        self.flat_button = self._secondary_button("从 JSON 生成扁平 Excel")
        self.flat_button.clicked.connect(self.export_flat_from_json)
        actions.addWidget(self.export_button)
        actions.addWidget(self.flat_button)
        actions.addStretch(1)
        actions_layout.addLayout(actions)
        shell.addWidget(actions_panel)

        results_panel = GlassPanel("resultsPanel")
        self.results_panel = results_panel
        results_layout = QVBoxLayout(results_panel)
        results_layout.setContentsMargins(24, 22, 24, 22)
        results_layout.setSpacing(16)

        results_head = QLabel("导出结果")
        results_head.setObjectName("sectionTitle")
        results_layout.addWidget(results_head)

        metrics = QHBoxLayout()
        metrics.setSpacing(12)
        self.top_metric = self._metric_tile("一级评论", "—")
        self.reply_metric = self._metric_tile("回复", "—")
        self.total_metric = self._metric_tile("总计", "—")
        metrics.addWidget(self.top_metric)
        metrics.addWidget(self.reply_metric)
        metrics.addWidget(self.total_metric)

        self.path_summary = QLabel("导出完成后，这里会显示生成文件的路径。")
        self.path_summary.setWordWrap(True)
        self.path_summary.setObjectName("pathSummary")

        self.activity_log = QPlainTextEdit()
        self.activity_log.setReadOnly(True)
        self.activity_log.setPlaceholderText("运行日志")
        self.activity_log.setFixedHeight(152)
        self.activity_log.setObjectName("activityLog")

        results_layout.addLayout(metrics)
        results_layout.addWidget(self.path_summary)
        results_layout.addWidget(self.activity_log)
        shell.addWidget(results_panel)

        self._append_log("就绪：粘贴链接后即可开始导出。")
        self.animated_targets = [self.hero_panel, self.form_panel, self.actions_panel, self.results_panel]
        self._prepare_entry_animation()

    def _apply_style(self) -> None:
        app = QApplication.instance()
        if app:
            app.setStyle("Fusion")
            app.setFont(QFont("PingFang SC", 13))

        self.setStyleSheet(
            """
            QMainWindow {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(242, 246, 252, 255),
                    stop:0.35 rgba(231, 238, 248, 255),
                    stop:1 rgba(220, 230, 244, 255));
            }
            #heroPanel, #formPanel, #resultsPanel {
                background: rgba(255, 255, 255, 0.72);
                border: 1px solid rgba(255, 255, 255, 0.84);
                border-radius: 28px;
            }
            #actionsPanel {
                background: rgba(246, 250, 255, 0.84);
                border: 1px solid rgba(220, 231, 243, 0.96);
                border-radius: 26px;
            }
            QLabel#eyebrow {
                color: rgb(93, 109, 130);
                font-size: 12px;
                letter-spacing: 1px;
            }
            QLabel#title {
                color: rgb(27, 38, 55);
                font-family: "Songti SC", "STSong";
                font-size: 41px;
                font-weight: 600;
            }
            QLabel#subtitle, QLabel#pathSummary, QLabel#sectionNote {
                color: rgb(79, 92, 111);
                font-size: 14px;
                line-height: 1.5;
            }
            QLabel#inlineNote {
                color: rgb(95, 108, 127);
                font-size: 13px;
            }
            QLabel#statusChip {
                background: rgba(239, 245, 250, 0.88);
                border: 1px solid rgba(187, 204, 223, 0.92);
                border-radius: 16px;
                color: rgb(57, 84, 116);
                font-size: 12px;
                font-weight: 600;
                padding: 8px 12px;
            }
            QLabel#sectionTitle {
                color: rgb(34, 48, 67);
                font-size: 18px;
                font-weight: 700;
            }
            QLabel[role="fieldLabel"] {
                color: rgb(53, 67, 88);
                font-size: 15px;
                font-weight: 600;
            }
            QLabel[role="fieldHint"] {
                color: rgb(107, 118, 135);
                font-size: 12px;
            }
            QLabel[role="bulletTitle"] {
                color: rgb(36, 50, 70);
                font-size: 15px;
                font-weight: 700;
            }
            QLabel[role="bulletBody"] {
                color: rgb(89, 100, 119);
                font-size: 13px;
            }
            QLineEdit, QComboBox, QPlainTextEdit {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(193, 207, 223, 0.98);
                border-radius: 18px;
                color: rgb(30, 40, 54);
                padding: 6px 16px;
                selection-background-color: rgba(134, 173, 214, 0.5);
                font-size: 14px;
            }
            QLineEdit:focus, QComboBox:focus, QPlainTextEdit:focus {
                border: 1px solid rgba(86, 129, 180, 1);
                background: rgba(255, 255, 255, 0.96);
            }
            QComboBox::drop-down {
                width: 34px;
                border: none;
            }
            QComboBox::down-arrow {
                image: none;
                width: 12px;
                height: 12px;
                border-left: 2px solid rgb(86, 104, 125);
                border-bottom: 2px solid rgb(86, 104, 125);
            }
            QPushButton {
                min-height: 50px;
                border-radius: 19px;
                padding: 0 20px;
                font-weight: 600;
                font-size: 15px;
            }
            QPushButton[role="primary"] {
                background: rgba(34, 119, 194, 0.95);
                color: rgb(247, 250, 253);
                border: 1px solid rgba(16, 93, 163, 0.92);
            }
            QPushButton[role="primary"]:hover {
                background: rgba(29, 111, 184, 0.98);
            }
            QPushButton[role="secondary"] {
                background: rgba(255, 255, 255, 0.86);
                color: rgb(53, 74, 99);
                border: 1px solid rgba(194, 209, 223, 0.98);
            }
            QPushButton[role="secondary"]:hover {
                background: rgba(249, 252, 255, 0.96);
                border: 1px solid rgba(179, 197, 216, 1);
            }
            QPushButton:disabled {
                color: rgba(53, 74, 99, 0.58);
            }
            QFrame[role="metric"] {
                background: rgba(252, 254, 255, 0.78);
                border: 1px solid rgba(216, 226, 235, 0.95);
                border-radius: 22px;
            }
            QLabel[role="metricLabel"] {
                color: rgb(94, 107, 124);
                font-size: 12px;
                font-weight: 600;
            }
            QLabel[role="metricValue"] {
                color: rgb(31, 42, 57);
                font-family: "Songti SC", "STSong";
                font-size: 28px;
                font-weight: 600;
            }
            """
        )

    def _field_label(self, text: str) -> QLabel:
        label = QLabel(text)
        label.setProperty("role", "fieldLabel")
        return label

    def _caption_label(self, text: str) -> QLabel:
        label = QLabel(text)
        label.setProperty("role", "fieldHint")
        label.setWordWrap(True)
        return label

    def _line_edit(self, placeholder: str) -> QLineEdit:
        field = QLineEdit()
        field.setPlaceholderText(placeholder)
        field.setMinimumHeight(56)
        field.setAlignment(Qt.AlignLeft | Qt.AlignVCenter)
        field.setClearButtonEnabled(True)
        return field

    def _primary_button(self, text: str) -> QPushButton:
        button = AnimatedButton(text)
        button.setProperty("role", "primary")
        return button

    def _secondary_button(self, text: str) -> QPushButton:
        button = AnimatedButton(text)
        button.setProperty("role", "secondary")
        return button

    def _metric_tile(self, label_text: str, value_text: str) -> QFrame:
        frame = QFrame()
        frame.setProperty("role", "metric")
        frame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(18, 16, 18, 16)
        label = QLabel(label_text)
        label.setProperty("role", "metricLabel")
        value = QLabel(value_text)
        value.setProperty("role", "metricValue")
        layout.addWidget(label)
        layout.addWidget(value)
        frame.metric_value = value
        return frame

    def _add_form_row(self, layout: QVBoxLayout, title: str, hint: str, content: QWidget) -> None:
        row = QWidget()
        row_layout = QVBoxLayout(row)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.setSpacing(6)

        if isinstance(content, QHBoxLayout):
            wrapper = QWidget()
            wrapper.setLayout(content)
            field_widget = wrapper
        else:
            field_widget = content

        row_layout.addWidget(self._field_label(title))
        row_layout.addWidget(self._caption_label(hint))
        row_layout.addWidget(field_widget)
        layout.addWidget(row)

    def _bullet_note(self, title: str, description: str) -> QWidget:
        wrapper = QWidget()
        layout = QHBoxLayout(wrapper)
        layout.setContentsMargins(0, 2, 0, 2)
        layout.setSpacing(12)
        dot = QLabel("●")
        dot.setStyleSheet("color: rgb(58, 132, 220); font-size: 12px;")
        body = QVBoxLayout()
        body.setSpacing(4)
        heading = QLabel(title)
        heading.setProperty("role", "bulletTitle")
        note = QLabel(description)
        note.setProperty("role", "bulletBody")
        note.setWordWrap(True)
        body.addWidget(heading)
        body.addWidget(note)
        layout.addWidget(dot, 0, Qt.AlignTop)
        layout.addLayout(body, 1)
        return wrapper

    def _prepare_entry_animation(self) -> None:
        self.entry_animations = []
        if os.environ.get("QT_QPA_PLATFORM") == "offscreen":
            return
        for index, widget in enumerate(self.animated_targets):
            effect = QGraphicsOpacityEffect(widget)
            widget.setGraphicsEffect(effect)
            effect.setOpacity(0.0)
            widget._opacity_effect = effect

            opacity_animation = QPropertyAnimation(effect, b"opacity", self)
            opacity_animation.setStartValue(0.0)
            opacity_animation.setEndValue(1.0)
            opacity_animation.setDuration(420 + index * 70)
            opacity_animation.setEasingCurve(QEasingCurve.OutCubic)

            group = QParallelAnimationGroup(self)
            group.addAnimation(opacity_animation)
            self.entry_animations.append(group)

    def showEvent(self, event) -> None:  # pragma: no cover - UI behavior
        super().showEvent(event)
        if not self._intro_played:
            self._intro_played = True
            QTimer.singleShot(90, self._play_entry_animation)

    def _play_entry_animation(self) -> None:
        for index, animation in enumerate(self.entry_animations):
            QTimer.singleShot(index * 80, animation.start)

    def choose_output_folder(self) -> None:
        folder = QFileDialog.getExistingDirectory(self, "选择导出文件夹")
        if folder:
            self.output_dir_input.setText(folder)

    def choose_json_file(self) -> None:
        filename, _ = QFileDialog.getOpenFileName(self, "选择导出 JSON", filter="JSON Files (*.json)")
        if filename:
            self.json_input.setText(filename)
            self.json_hint.setText(f"已选择 JSON：{filename}")

    def export_all(self) -> None:
        if not self.url_input.text().strip():
            self._set_status("缺少链接", error=True)
            return
        if not self.api_key_input.text().strip():
            self._set_status("缺少密钥", error=True)
            return
        if not self.output_dir_input.text().strip():
            self._set_status("选择文件夹", error=True)
            return

        self._run_worker(
            "export_all",
            {
                "url": self.url_input.text().strip(),
                "api_key": self.api_key_input.text().strip(),
                "output_dir": self.output_dir_input.text().strip(),
                "order": self.order_input.currentData(),
            },
        )

    def export_flat_from_json(self) -> None:
        if not self.json_input.text().strip():
            self.choose_json_file()
            if not self.json_input.text().strip():
                self._set_status("缺少 JSON", error=True)
                return
        if not self.output_dir_input.text().strip():
            self._set_status("选择文件夹", error=True)
            return

        self._run_worker(
            "flat_from_json",
            {
                "json_path": self.json_input.text().strip(),
                "output_dir": self.output_dir_input.text().strip(),
            },
        )

    def _run_worker(self, mode: str, payload: dict) -> None:
        self.export_button.setEnabled(False)
        self.flat_button.setEnabled(False)
        self._append_log("开始处理，请稍候…")
        self._set_status("处理中", error=False)
        self.worker = ExportWorker(mode, payload)
        self.worker.success.connect(self._handle_success)
        self.worker.error.connect(self._handle_error)
        self.worker.finished.connect(self._reset_actions)
        self.worker.start()

    def _handle_success(self, result: dict) -> None:
        summary = result.get("summary", {})
        self.top_metric.metric_value.setText(str(summary.get("top_level_comment_count", "—")))
        self.reply_metric.metric_value.setText(str(summary.get("reply_count", "—")))
        self.total_metric.metric_value.setText(str(summary.get("total_comment_count", "—")))
        path_lines = [f"{name}：{path}" for name, path in result.get("paths", {}).items()]
        self.path_summary.setText("\n".join(path_lines) if path_lines else "导出完成。")
        self._append_log("导出完成。")
        self._set_status("已完成", error=False)
        self._pulse_metrics()

    def _handle_error(self, message: str) -> None:
        self._append_log(f"错误：{message}")
        self._set_status("失败", error=True)

    def _reset_actions(self) -> None:
        self.export_button.setEnabled(True)
        self.flat_button.setEnabled(True)

    def _append_log(self, message: str) -> None:
        self.activity_log.appendPlainText(message)

    def _set_status(self, text: str, error: bool) -> None:
        self.status_chip.setText(text)
        palette = "rgba(255, 241, 238, 0.92)" if error else "rgba(238, 244, 249, 0.82)"
        border = "rgba(209, 128, 105, 0.95)" if error else "rgba(185, 203, 220, 0.9)"
        color = QColor(146, 70, 54) if error else QColor(57, 84, 116)
        self.status_chip.setStyleSheet(
            f"background:{palette}; border:1px solid {border}; border-radius:14px; color:{color.name()}; font-size:12px; font-weight:600; padding:6px 10px;"
        )

    def _pulse_metrics(self) -> None:
        for tile in (self.top_metric, self.reply_metric, self.total_metric):
            effect = QGraphicsOpacityEffect(tile)
            tile.setGraphicsEffect(effect)
            effect.setOpacity(0.72)
            animation = QPropertyAnimation(effect, b"opacity", self)
            animation.setStartValue(0.72)
            animation.setEndValue(1.0)
            animation.setDuration(320)
            animation.setEasingCurve(QEasingCurve.OutCubic)
            animation.start()


def build_app(argv: list) -> QApplication:
    app = QApplication.instance()
    if app is None:
        app = QApplication(argv)
        app.setApplicationName("YouTube 评论导出器")
        app.setOrganizationName("Codex")
    return app


def build_main_window() -> MacExporterWindow:
    return MacExporterWindow()


def main(argv: Optional[List[str]] = None) -> int:
    app = build_app(argv or sys.argv)
    window = build_main_window()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
