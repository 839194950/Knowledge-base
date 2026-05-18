
import sys
import os
import argparse
from pathlib import Path

# 检查 pdfplumber
try:
    import pdfplumber
except ImportError:
    print("正在安装 pdfplumber...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber


def extract_pdf(pdf_path, output_dir=None):
    """
    提取 PDF 文件内容并保存到文本文件
    
    Args:
        pdf_path: PDF 文件路径
        output_dir: 输出目录，默认为 raw/articles/
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        print(f"错误: 文件不存在: {pdf_path}")
        return False
    
    if output_dir is None:
        # 默认输出到项目根目录下的 raw/articles/
        project_root = Path(__file__).parent
        output_dir = project_root / "raw" / "articles"
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 生成输出文件名
    output_filename = pdf_path.stem + ".txt"
    output_path = output_dir / output_filename
    
    print(f"正在读取 PDF: {pdf_path}")
    
    all_text = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"PDF 共有 {len(pdf.pages)} 页")
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                all_text.append(f"--- 第 {i+1} 页 ---\n{text}")
            else:
                all_text.append(f"--- 第 {i+1} 页 (无文本内容)")
    
    full_text = "\n\n".join(all_text)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"标题: {pdf_path.stem}\n")
        f.write(f"来源: {pdf_path}\n")
        f.write(f"页数: {len(pdf.pages)}\n")
        f.write("\n内容:\n\n")
        f.write(full_text)
    
    print(f"PDF 内容已保存到: {output_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description="提取 PDF 文件内容为文本")
    parser.add_argument("pdf_path", nargs="?", help="PDF 文件路径")
    parser.add_argument("-o", "--output", help="输出目录")
    
    args = parser.parse_args()
    
    if args.pdf_path:
        # 使用命令行参数
        extract_pdf(args.pdf_path, args.output)
    else:
        # 默认行为：处理 raw/pdfs/ 目录下的所有 PDF 文件
        project_root = Path(__file__).parent
        pdfs_dir = project_root / "raw" / "pdfs"
        
        if not pdfs_dir.exists():
            print(f"错误: PDF 目录不存在: {pdfs_dir}")
            return
        
        pdf_files = list(pdfs_dir.glob("*.pdf"))
        
        if not pdf_files:
            print(f"在 {pdfs_dir} 目录下未找到 PDF 文件")
            return
        
        print(f"找到 {len(pdf_files)} 个 PDF 文件")
        
        for pdf_file in pdf_files:
            print(f"\n处理: {pdf_file.name}")
            extract_pdf(pdf_file, args.output)


if __name__ == "__main__":
    main()

