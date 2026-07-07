import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiFileText,
  FiPaperclip,
  FiPlus,
  FiPrinter,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const RESERVED_KEYS = [
  "title",
  "subtitle",
  "description",
  "summary",
  "meta",
  "sections",
  "content",
  "contentHtml",
  "chartImage",
  "chartImages",
  "images",
  "footer",
  "notes",
  "generatedAt",
];

const PRINT_CAPTURE_PREFIX = "printCapture:";

const safeParseData = (dataStr) => {
  if (!dataStr) return {};

  try {
    return JSON.parse(decodeURIComponent(dataStr));
  } catch (error) {
    console.error("Failed to parse print data:", error);
    return {
      title: "Invalid print data",
      description: "The print payload could not be read.",
      rawData: dataStr,
    };
  }
};

const isPrimitive = (value) =>
  value == null || ["string", "number", "boolean"].includes(typeof value);

const isPlainObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isImageSource = (value) =>
  typeof value === "string" &&
  /^(data:image\/|https?:\/\/|\/)/i.test(value.trim());

const isPdfSource = (value) =>
  typeof value === "string" && value.startsWith("data:application/pdf");

const formatLabel = (value = "") =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : String(value);
  }
  return String(value);
};

const formatFileSize = (size = 0) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / 1024 ** unitIndex;
  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

const getStoredPrintCapture = (key) => {
  if (!key) return null;

  try {
    const raw = sessionStorage.getItem(`${PRINT_CAPTURE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to read stored print capture:", error);
    return null;
  }
};

const getPanelScopeFromPathname = (pathname = "") => {
  if (pathname.startsWith("/admin/")) return "admin";
  if (pathname.startsWith("/teacher/")) return "teacher";
  if (pathname.startsWith("/staff/")) return "staff";
  if (pathname.startsWith("/student/")) return "student";
  return null;
};

const getLatestPanelPrintCapture = (pathname) => {
  const scope = getPanelScopeFromPathname(pathname);
  if (!scope) return null;

  try {
    const raw = sessionStorage.getItem(
      `${PRINT_CAPTURE_PREFIX}${scope}:latest`,
    );
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to read latest panel print capture:", error);
    return null;
  }
};

const getTableColumns = (rows = [], explicitColumns = []) => {
  if (explicitColumns?.length) {
    return explicitColumns.map((column) =>
      typeof column === "string"
        ? { key: column, label: formatLabel(column) }
        : { key: column.key, label: column.label || formatLabel(column.key) },
    );
  }

  const keys = Array.from(
    new Set(
      rows.flatMap((row) => (isPlainObject(row) ? Object.keys(row) : [])),
    ),
  );

  return keys.map((key) => ({ key, label: formatLabel(key) }));
};

const parseChartRows = (value = "") =>
  String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, amount] = line.split("|");
      return {
        label: (label || "").trim(),
        value: Number((amount || "0").trim()),
      };
    })
    .filter((item) => item.label);

const parseTableRows = (columnsInput = "", rowsInput = "") => {
  const columns = String(columnsInput)
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);

  const rows = String(rowsInput)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .map((cells, rowIndex) => {
      const row = { id: `row-${rowIndex}` };
      columns.forEach((column, columnIndex) => {
        row[column] = cells[columnIndex] || "";
      });
      return row;
    });

  return { columns, rows };
};

const renderPrimitiveBlock = (value) => (
  <p className="whitespace-pre-wrap text-gray-700 break-all">
    {formatValue(value)}
  </p>
);

const renderKeyValueBlock = (data, t) => {
  const entries = Object.entries(data || {}).filter(
    ([, value]) => value !== undefined,
  );

  if (!entries.length) {
    return <p className="text-sm text-gray-500">{t("noDetails")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {formatLabel(key)}
          </p>
          <div className="mt-1 text-sm text-gray-800">
            {isPrimitive(value)
              ? formatValue(value)
              : Array.isArray(value)
                ? value.map((item) => formatValue(item)).join(", ") || "—"
                : JSON.stringify(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

const renderTableBlock = (rows = [], columns = [], t) => {
  if (!rows.length) {
    return <p className="text-sm text-gray-500">{t("noRows")}</p>;
  }

  const resolvedColumns = getTableColumns(rows, columns);

  if (!resolvedColumns.length) {
    return <p className="text-sm text-gray-500">{t("noColumns")}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            {resolvedColumns.map((column) => (
              <th
                key={column.key}
                className="border border-gray-300 px-3 py-2 font-semibold text-gray-700"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row._id || rowIndex} className="align-top">
              {resolvedColumns.map((column) => {
                const cellValue = row?.[column.key];
                return (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="border border-gray-300 px-3 py-2 text-gray-700"
                  >
                    {isPrimitive(cellValue)
                      ? formatValue(cellValue)
                      : Array.isArray(cellValue)
                        ? cellValue
                            .map((item) => formatValue(item))
                            .join(", ") || "—"
                        : cellValue
                          ? JSON.stringify(cellValue)
                          : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderListBlock = (items = [], ordered = false, t) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500">{t("noItems")}</p>;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      className={`space-y-2 text-gray-700 ${ordered ? "list-decimal" : "list-disc"} pl-6`}
    >
      {items.map((item, index) => (
        <li key={index}>
          {isPrimitive(item)
            ? formatValue(item)
            : isPlainObject(item)
              ? Object.entries(item)
                  .map(
                    ([key, value]) =>
                      `${formatLabel(key)}: ${formatValue(value)}`,
                  )
                  .join(" • ")
              : String(item)}
        </li>
      ))}
    </ListTag>
  );
};

const renderImageBlock = ({ src, alt, caption, className = "" }, t) => {
  if (!src || !isImageSource(src)) {
    return <p className="text-sm text-gray-500">{t("imageNotAvailable")}</p>;
  }

  return (
    <figure className="space-y-3">
      <img
        src={src}
        alt={alt || caption || "Print visual"}
        className={`max-h-[480px] w-full rounded-lg border border-gray-200 object-contain ${className}`.trim()}
      />
      {caption && (
        <figcaption className="text-sm text-gray-500">{caption}</figcaption>
      )}
    </figure>
  );
};

const renderPdfBlock = ({ src, title }, t) => {
  if (!src || !isPdfSource(src)) {
    return <p className="text-sm text-gray-500">{t("pdfNotAvailable")}</p>;
  }

  return (
    <div className="space-y-3">
      <object
        data={src}
        type="application/pdf"
        className="h-[720px] w-full rounded-lg border border-gray-200"
      >
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          {t("pdfBrowserNotAvailable")}
        </div>
      </object>
      {title && <p className="text-sm text-gray-500">{title}</p>}
    </div>
  );
};

const renderChartBlock = (items = [], t) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500">{t("noChartData")}</p>;
  }

  const maxValue = Math.max(...items.map((item) => Number(item.value) || 0), 1);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      {items.map((item, index) => {
        const safeValue = Number(item.value) || 0;
        const width = `${Math.max((safeValue / maxValue) * 100, 4)}%`;
        return (
          <div key={`${item.label}-${index}`} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <span className="font-medium">{item.label}</span>
              <span>{formatValue(safeValue)}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderAttachmentBlock = (file, t) => {
  if (file.kind === "image") {
    return renderImageBlock({
      src: file.preview,
      alt: file.name,
      caption: file.name,
    }, t);
  }

  if (file.kind === "pdf") {
    return renderPdfBlock({ src: file.preview, title: file.name }, t);
  }

  if (file.kind === "text") {
    return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
          <span>{file.type || t("textFile")}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
        <pre className="whitespace-pre-wrap break-all rounded-lg bg-white p-4 text-sm text-gray-800">
          {file.textContent || t("noTextContent")}
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-3 text-gray-700">
        <FiFileText className="shrink-0" />
        <div>
          <p className="break-all text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-500">
            {file.type || t("unknownType")} • {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        {t("noPreviewAvailable")}
      </p>
    </div>
  );
};

const renderSection = (section, index, t) => {
  if (section == null) return null;

  const normalizedSection = isPlainObject(section)
    ? section
    : { type: "text", content: section };

  const {
    type,
    title,
    subtitle,
    content,
    text,
    data,
    rows,
    columns,
    items,
    ordered,
    src,
    image,
    caption,
    images,
    dataPoints,
    file,
  } = normalizedSection;

  let body = null;

  switch (type) {
    case "text":
    case "paragraph":
      body = renderPrimitiveBlock(content ?? text ?? "");
      break;
    case "keyValue":
    case "summary":
    case "details":
      body = renderKeyValueBlock(data || content || {}, t);
      break;
    case "table":
      body = renderTableBlock(rows || data || [], columns || [], t);
      break;
    case "list":
      body = renderListBlock(items || data || [], ordered, t);
      break;
    case "chart":
      body =
        src || image
          ? renderImageBlock({ src: src || image, alt: title, caption }, t)
          : renderChartBlock(dataPoints || items || data || [], t);
      break;
    case "pdf":
      body = renderPdfBlock({ src: src || content, title: title || caption }, t);
      break;
    case "file":
      body = renderAttachmentBlock(file || data || {}, t);
      break;
    case "html":
      body = (
        <div
          className="captured-print-content overflow-hidden [&_svg]:max-w-full [&_table]:w-full"
          dangerouslySetInnerHTML={{
            __html: content || normalizedSection.html || "",
          }}
        />
      );
      break;
    case "images":
    case "gallery":
      body = (
        <div className="space-y-6">
          {(images || data || []).map((item, imageIndex) =>
            renderImageBlock(
              typeof item === "string"
                ? { src: item }
                : {
                    src: item.src || item.image,
                    alt: item.alt || item.title,
                    caption: item.caption || item.title,
                  },
              t,
            ),
          )}
        </div>
      );
      break;
    default:
      if (isPrimitive(content ?? data)) {
        body = renderPrimitiveBlock(content ?? data);
      } else if (Array.isArray(content ?? data)) {
        const arrayValue = content ?? data;
        body = arrayValue.every((item) => isPlainObject(item))
          ? renderTableBlock(arrayValue, columns || [], t)
          : renderListBlock(arrayValue, ordered, t);
      } else if (isPlainObject(content ?? data)) {
        body = renderKeyValueBlock(content ?? data, t);
      }
  }

  if (!body) return null;

  return (
    <section
      key={normalizedSection.id || `${title || type || "section"}-${index}`}
      className="space-y-3"
    >
      {title && (
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      )}
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {body}
    </section>
  );
};

const buildGenericSections = (printData, t) => {
  const sections = [];

  if (printData.summary && isPlainObject(printData.summary)) {
    sections.push({
      type: "summary",
      title: t("summary"),
      data: printData.summary,
    });
  }

  if (printData.meta && isPlainObject(printData.meta)) {
    sections.push({ type: "details", title: t("details"), data: printData.meta });
  }

  if (printData.contentHtml) {
    sections.push({
      type: "html",
      title: printData.contentTitle || t("contentSection"),
      content: printData.contentHtml,
    });
  } else if (printData.content) {
    sections.push(
      isPlainObject(printData.content) && printData.content.type
        ? printData.content
        : {
            type: isPlainObject(printData.content) ? "details" : "text",
            title: t("contentSection"),
            data: printData.content,
            content: printData.content,
          },
    );
  }

  if (printData.chartImage) {
    sections.push({
      type: "chart",
      title: t("chart"),
      image: printData.chartImage,
      caption: printData.chartCaption,
    });
  }

  if (Array.isArray(printData.chartImages) && printData.chartImages.length) {
    sections.push({
      type: "gallery",
      title: t("charts"),
      images: printData.chartImages,
    });
  }

  if (Array.isArray(printData.images) && printData.images.length) {
    sections.push({
      type: "gallery",
      title: t("images"),
      images: printData.images,
    });
  }

  Object.entries(printData || {}).forEach(([key, value]) => {
    if (RESERVED_KEYS.includes(key) || value == null) return;

    if (isPrimitive(value)) {
      sections.push({
        type: "details",
        title: formatLabel(key),
        data: { [key]: value },
      });
      return;
    }

    if (Array.isArray(value)) {
      if (!value.length) return;

      sections.push(
        value.every((item) => isPlainObject(item))
          ? { type: "table", title: formatLabel(key), rows: value }
          : { type: "list", title: formatLabel(key), items: value },
      );
      return;
    }

    if (isPlainObject(value)) {
      sections.push({ type: "details", title: formatLabel(key), data: value });
    }
  });

  if (printData.notes) {
    sections.push({ type: "text", title: t("notes"), content: printData.notes });
  }

  if (printData.footer) {
    sections.push({ type: "text", title: t("footer"), content: printData.footer });
  }

  return sections;
};

const defaultLayoutForm = {
  type: "text",
  title: "",
  subtitle: "",
  content: "",
  tableColumns: "",
  tableRows: "",
  chartRows: "",
};

const PrintPage = () => {
  const { t } = useTranslation('print');
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { type, id } = params;

  const queryParams = new URLSearchParams(location.search);
  const dataStr = queryParams.get("data");
  const queryPrintData = safeParseData(dataStr);
  const storedPrintData =
    type === "home"
      ? getStoredPrintCapture(id) ||
        getLatestPanelPrintCapture(location.pathname)
      : null;
  const printData = storedPrintData
    ? {
        ...queryPrintData,
        ...storedPrintData,
        sections: storedPrintData.sections || queryPrintData.sections,
      }
    : queryPrintData;

  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [layoutSections, setLayoutSections] = useState([]);
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutForm, setLayoutForm] = useState(defaultLayoutForm);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-area, #print-area * {
          visibility: visible;
        }
        #print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          box-shadow: none;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const normalizedFiles = await Promise.all(
      files.map(async (file, index) => {
        const base = {
          id: `${file.name}-${file.size}-${index}`,
          name: file.name,
          type: file.type || "Unknown",
          size: file.size,
        };

        if (file.type.startsWith("image/")) {
          return {
            ...base,
            kind: "image",
            preview: await readFileAsDataUrl(file),
          };
        }

        if (file.type === "application/pdf") {
          return {
            ...base,
            kind: "pdf",
            preview: await readFileAsDataUrl(file),
          };
        }

        if (
          file.type.startsWith("text/") ||
          file.type.includes("json") ||
          file.type.includes("csv")
        ) {
          return {
            ...base,
            kind: "text",
            textContent: await readFileAsText(file),
          };
        }

        return {
          ...base,
          kind: "other",
        };
      }),
    );

    setAttachedFiles((previous) => [...previous, ...normalizedFiles]);
    event.target.value = "";
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles((previous) =>
      previous.filter((file) => file.id !== fileId),
    );
  };

  const handleLayoutFieldChange = (field, value) => {
    setLayoutForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddLayoutSection = () => {
    if (!layoutForm.title.trim() && layoutForm.type !== "text") {
      return;
    }

    if (layoutForm.type === "text") {
      if (!layoutForm.content.trim()) return;
      setLayoutSections((previous) => [
        ...previous,
        {
          id: `layout-${previous.length + 1}`,
          type: "text",
          title: layoutForm.title.trim() || "Content",
          subtitle: layoutForm.subtitle.trim(),
          content: layoutForm.content.trim(),
        },
      ]);
    }

    if (layoutForm.type === "table") {
      const parsed = parseTableRows(
        layoutForm.tableColumns,
        layoutForm.tableRows,
      );
      if (!parsed.columns.length || !parsed.rows.length) return;
      setLayoutSections((previous) => [
        ...previous,
        {
          id: `layout-${previous.length + 1}`,
          type: "table",
          title: layoutForm.title.trim() || "Table",
          subtitle: layoutForm.subtitle.trim(),
          columns: parsed.columns,
          rows: parsed.rows,
        },
      ]);
    }

    if (layoutForm.type === "chart") {
      const chartItems = parseChartRows(layoutForm.chartRows);
      if (!chartItems.length) return;
      setLayoutSections((previous) => [
        ...previous,
        {
          id: `layout-${previous.length + 1}`,
          type: "chart",
          title: layoutForm.title.trim() || "Chart",
          subtitle: layoutForm.subtitle.trim(),
          dataPoints: chartItems,
        },
      ]);
    }

    setLayoutForm(defaultLayoutForm);
  };

  const handleRemoveLayoutSection = (sectionId) => {
    setLayoutSections((previous) =>
      previous.filter((section) => section.id !== sectionId),
    );
  };

  const getLegacyPreset = () => {
    switch (type) {
      case "home":
        return null;
      case "fee":
      case "fee-receipt":
        return {
          title: t("typeFeeReceipt"),
          sections: [
            {
              type: "details",
              data: {
                date: printData.date || new Date().toLocaleDateString(),
                studentName: printData.studentName || "",
                class: printData.className || "",
                rollNumber: printData.rollNumber || "",
                feeAmount: printData.feeAmount || "",
                paidDate: printData.paidDate || "",
                status: printData.status || "Paid",
              },
            },
          ],
        };
      case "attendance-report":
        return {
          title: t("typeAttendanceReport"),
          sections: [
            {
              type: "details",
              data: {
                attendanceDate:
                  printData.date || new Date().toLocaleDateString(),
              },
            },
            {
              type: "table",
              title: t("attendanceRecords"),
              rows: printData.records || [],
              columns: [
                { key: "studentName", label: t("studentName") },
                { key: "className", label: t("class") },
                { key: "status", label: t("status") },
              ],
            },
          ],
        };
      case "certificate":
        return {
          title: `${t("certificateOf")} ${printData.certificateType || "Achievement"}`,
          sections: [
            {
              type: "text",
              content: printData.description || "",
            },
            {
              type: "details",
              data: {
                studentName: printData.studentName || "",
                issuedBy: printData.issuedBy || "Madrasa Management",
                issuedDate:
                  printData.issuedDate || new Date().toLocaleDateString(),
              },
            },
          ],
        };
      case "exam-result":
        return {
          title: t("typeExamResult"),
          sections: [
            {
              type: "details",
              data: {
                examName: printData.examName || "",
                studentName: printData.studentName || "",
                class: printData.className || "",
                rollNumber: printData.rollNumber || "",
              },
            },
            {
              type: "table",
              title: "Subjects",
              rows: printData.subjects || [],
              columns: [
                { key: "name", label: t("subject") },
                { key: "marks", label: t("marks") },
                { key: "totalMarks", label: t("totalMarks") },
                { key: "grade", label: t("grade") },
              ],
            },
          ],
        };
      default:
        return null;
    }
  };

  const resolvedDocument = (() => {
    if (
      printData?.sections ||
      printData?.content ||
      printData?.title ||
      printData?.chartImage ||
      printData?.images ||
      printData?.meta ||
      printData?.summary
    ) {
      return {
        title: printData.title || formatLabel(type || "Print Document"),
        subtitle: printData.subtitle,
        description: printData.description,
        sections: printData.sections || buildGenericSections(printData, t),
      };
    }

    const legacyPreset = getLegacyPreset();
    if (legacyPreset) return legacyPreset;

    return {
      title: printData.title || "",
      description: printData?.rawData
        ? "The print payload could not be parsed."
        : "",
      sections: buildGenericSections(printData, t),
    };
  })();

  const attachedFileSections = attachedFiles.map((file) => ({
    id: `file-${file.id}`,
    type: "file",
    title: file.name,
    subtitle: `${file.type || "Unknown type"} • ${formatFileSize(file.size)}`,
    file,
  }));

  const resolvedSections = [
    ...(resolvedDocument.sections || []),
    ...layoutSections,
    ...attachedFileSections,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print border-b border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            <FiX />
            {t("closeButton")}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold">{t("title")}</h1>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            <button
              onClick={() => setShowLayoutBuilder((previous) => !previous)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiPlus />
              {t("createLayout")}
            </button>

            <button
              onClick={handleOpenFilePicker}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiPaperclip />
              {t("addFiles")}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <FiPrinter />
              {t("printButton")}
            </button>
          </div>
        </div>

        {showLayoutBuilder && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("sectionType")}
                    </label>
                    <select
                      value={layoutForm.type}
                      onChange={(event) =>
                        handleLayoutFieldChange("type", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="text">{t("sectionTypeContent")}</option>
                      <option value="table">{t("sectionTypeTable")}</option>
                      <option value="chart">{t("sectionTypeChart")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("titleLabel")}
                    </label>
                    <input
                      type="text"
                      value={layoutForm.title}
                      onChange={(event) =>
                        handleLayoutFieldChange("title", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t("sectionTitlePlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("subtitleLabel")}
                    </label>
                    <input
                      type="text"
                      value={layoutForm.subtitle}
                      onChange={(event) =>
                        handleLayoutFieldChange("subtitle", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t("subtitlePlaceholder")}
                    />
                  </div>
                </div>

                {layoutForm.type === "text" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("contentLabel")}
                    </label>
                    <textarea
                      rows={8}
                      value={layoutForm.content}
                      onChange={(event) =>
                        handleLayoutFieldChange("content", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t("contentPlaceholder")}
                    />
                  </div>
                )}

                {layoutForm.type === "table" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("columns")}
                      </label>
                      <input
                        type="text"
                        value={layoutForm.tableColumns}
                        onChange={(event) =>
                          handleLayoutFieldChange(
                            "tableColumns",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder={t("columnsPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("rows")}
                      </label>
                      <textarea
                        rows={8}
                        value={layoutForm.tableRows}
                        onChange={(event) =>
                          handleLayoutFieldChange(
                            "tableRows",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder={t("rowsPlaceholder")}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t("rowsHint")}
                      </p>
                    </div>
                  </div>
                )}

                {layoutForm.type === "chart" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("chartData")}
                    </label>
                    <textarea
                      rows={8}
                      value={layoutForm.chartRows}
                      onChange={(event) =>
                        handleLayoutFieldChange("chartRows", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t("chartDataPlaceholder")}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t("chartDataHint")}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAddLayoutSection}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {t("addToPrintPage")}
                  </button>
                  <button
                    onClick={() => setLayoutForm(defaultLayoutForm)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-white"
                  >
                    {t("resetForm")}
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-base font-semibold text-gray-800">
                  {t("createdLayoutSections")}
                </h2>
                {layoutSections.length ? (
                  layoutSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {section.title || formatLabel(section.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatLabel(section.type)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveLayoutSection(section.id)}
                        className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-red-600"
                        title={t("removeSection")}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    {t("noLayoutSections")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        id="print-area"
        className="mx-auto my-8 max-w-5xl bg-white shadow-lg"
      >
        <div className="space-y-8 p-8">
          {(resolvedDocument.title ||
            resolvedDocument.subtitle ||
            resolvedDocument.description) && (
            <div className="border-b border-gray-200 pb-6">
              {resolvedDocument.title && (
                <h2 className="text-3xl font-bold text-gray-900">
                  {resolvedDocument.title}
                </h2>
              )}
              {resolvedDocument.subtitle && (
                <p className="mt-2 text-lg text-gray-600">
                  {resolvedDocument.subtitle}
                </p>
              )}
              {resolvedDocument.description && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {resolvedDocument.description}
                </p>
              )}
            </div>
          )}

          {resolvedSections.map((section, index) =>
            renderSection(section, index, t),
          )}

          {attachedFiles.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("addedFiles", { count: attachedFiles.length })}
              </h2>
              <div className="no-print grid grid-cols-1 gap-3 md:grid-cols-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="break-all text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.type || t("unknownType")} •{" "}
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-red-600"
                      title={t("removeFile")}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintPage;
