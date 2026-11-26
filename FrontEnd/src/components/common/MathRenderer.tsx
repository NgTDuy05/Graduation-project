'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Tiền xử lý văn bản: Tự động phát hiện các biểu thức toán học dạng thô
 * (như y = x^4 + 2x^2 + 1, y = (x + 1) / (x - 2), (-∞; 1), tập số thực R, v.v.)
 * và bọc vào định dạng LaTeX chuẩn $...$ để KaTeX kết xuất đẹp mắt.
 */
function preprocessMathContent(text: string): string {
  if (!text) return '';

  let s = text;
  const hasDollar = s.includes('$');

  if (!hasDollar) {
    // 1. Chuẩn hóa các ký hiệu đặc biệt sang mã LaTeX
    s = s.replace(/∞/g, '\\infty');
    s = s.replace(/±/g, '\\pm');
    s = s.replace(/<=>|<=>/g, '\\Leftrightarrow');
    s = s.replace(/=>|=>/g, '\\Rightarrow');
    s = s.replace(/∈/g, '\\in');
    s = s.replace(/≥/g, '\\ge');
    s = s.replace(/≤/g, '\\le');
    s = s.replace(/≠/g, '\\ne');

    // Chuyển tập số thực R thành \mathbb{R}
    s = s.replace(/tập số thực\s+R\b/g, 'tập số thực $\\mathbb{R}$');
    s = s.replace(/\btrên\s+R\b/g, 'trên $\\mathbb{R}$');

    // 2. Tự động nhận diện biểu thức toán học nếu chưa có dấu $
    // a. Dạng khoảng/đoạn kết hợp từ "và": "(-∞; -1) và (1; +∞)"
    if (s.includes(' và ') && (s.includes('\\infty') || s.includes(';'))) {
      s = s.replace(/([\[\(]\s*[^;]+?\s*;\s*[^;\)]+?\s*[\]\)])/g, '$$$1$$');
    }
    // b. Dạng khoảng/đoạn đơn: "(-1; 1)", "(-∞; -1)", "[2; +∞)"
    else if (/^[\[\(]\s*[^;]+?\s*;\s*[^;]+?\s*[\]\)]$/.test(s.trim())) {
      s = `$${s.trim()}$`;
    }
    // c. Dạng D = ... (tập xác định)
    else if (/^D\s*=\s*/.test(s.trim())) {
      let math = s.trim();
      math = math.replace(/\bR\b/g, '\\mathbb{R}');
      s = `$${math}$`;
    }
    // d. Dạng phương trình/hàm số bắt đầu bằng y =, f(x) =, y' =, P =, I =, n =
    else if (/^(y|y'|f\(x\)|f'\(x\)|P|I|n)\s*=/i.test(s.trim())) {
      let math = s.trim();
      // Chuyển phân số dạng (A) / (B) hoặc A / B thành \frac{A}{B}
      math = math.replace(/\(([^\)]+)\)\s*\/\s*\(([^\)]+)\)/g, '\\frac{$1}{$2}');
      math = math.replace(/([a-zA-Z0-9_\^\+]+)\s*\/\s*([a-zA-Z0-9_\^\+]+)/g, '\\frac{$1}{$2}');
      math = math.replace(/\btan\(/g, '\\tan(');
      math = math.replace(/\bcos\(/g, '\\cos(');
      math = math.replace(/\bsin\(/g, '\\sin(');
      math = math.replace(/\^([0-9]+)/g, '^{$1}');
      s = `$${math}$`;
    }
    // e. Chứa số mũ như x^2, x^3, x^4, v.v.
    else if (/\b[a-zA-Z]\^[0-9]+/.test(s)) {
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(s);
      if (!hasVietnamese) {
        let math = s.trim();
        math = math.replace(/\^([0-9]+)/g, '^{$1}');
        s = `$${math}$`;
      } else {
        s = s.replace(/(y\s*=\s*[^,\.\n]+)/g, (match) => {
          let math = match.replace(/\^([0-9]+)/g, '^{$1}');
          return `$${math}$`;
        });
      }
    }
    // f. Hàm lượng giác đơn lẻ: tan(x), sin(x), cos(x)
    else if (/^(tan|sin|cos|cot)\([a-zA-Z0-9\s\+\-]+\)$/i.test(s.trim())) {
      s = `$\\${s.trim()}$`;
    }
  } else {
    // Nếu đã có dấu $, chuẩn hóa lũy thừa x^2 -> x^{2} và các ký hiệu để KaTeX parse hoàn hảo
    s = s.replace(/\$([^\$]+)\$/g, (_, inner) => {
      let clean = inner.replace(/\^([0-9]+)/g, '^{$1}');
      clean = clean.replace(/∞/g, '\\infty');
      clean = clean.replace(/±/g, '\\pm');
      clean = clean.replace(/<=>|<=>/g, '\\Leftrightarrow');
      clean = clean.replace(/=>|=>/g, '\\Rightarrow');
      clean = clean.replace(/≥/g, '\\ge');
      clean = clean.replace(/≤/g, '\\le');
      clean = clean.replace(/≠/g, '\\ne');
      return `$${clean}$`;
    });
  }

  return s;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Tiền xử lý để tự bọc công thức thô thành LaTeX
    const normalizedContent = preprocessMathContent(content);

    const mathBlocks: string[] = [];
    const mathInlines: string[] = [];

    // 1. Tách các khối công thức độc lập $$...$$
    let processed = normalizedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const id = mathBlocks.length;
      mathBlocks.push(math.trim());
      return `\n\nKATEXBLOCK${id}KATEX\n\n`;
    });

    // 2. Tách các công thức inline $...$
    processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
      const id = mathInlines.length;
      mathInlines.push(math.trim());
      return `KATEXINLINE${id}KATEX`;
    });

    // 3. Parse Markdown (hỗ trợ in đậm, tiêu đề, danh sách, gạch đầu dòng)
    let html = marked.parse(processed, { breaks: true, gfm: true }) as string;

    // 4. Phục hồi và render công thức khối bằng KaTeX
    html = html.replace(
      /<p>KATEXBLOCK(\d+)KATEX<\/p>|KATEXBLOCK(\d+)KATEX/g,
      (_, id1, id2) => {
        const id = id1 !== undefined ? id1 : id2;
        const raw = mathBlocks[Number(id)] || '';
        try {
          const rendered = katex.renderToString(raw, {
            displayMode: true,
            throwOnError: false,
          });
          return `<div class="katex-display-container my-3 p-2 bg-slate-50/80 rounded-xl overflow-x-auto text-center border border-slate-100">${rendered}</div>`;
        } catch {
          return `<div class="katex-error my-2 p-2 bg-rose-50 text-rose-600 text-xs rounded-lg font-mono">$$${raw}$$</div>`;
        }
      },
    );

    // 5. Phục hồi và render công thức inline bằng KaTeX
    html = html.replace(/KATEXINLINE(\d+)KATEX/g, (_, id) => {
      const raw = mathInlines[Number(id)] || '';
      try {
        return katex.renderToString(raw, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${raw}$`;
      }
    });

    return html;
  }, [content]);

  return (
    <div
      className={`math-rendered-content text-xs sm:text-sm leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
