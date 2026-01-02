# Soul Carrier Proposal - Markdown to PDF Conversion
#
# Prerequisites (install one of these):
#   - pandoc + wkhtmltopdf (recommended)
#   - pandoc + latex (for high-quality output)
#   - md-to-pdf (npm install -g md-to-pdf)

# Variables
MD_FILES = soul_carrier_proposal_jp.md soul_carrier_proposal_en.md
PDF_FILES = $(MD_FILES:.md=.pdf)
CSS_FILE = style.css

# Default target
all: pdf

# Generate all PDFs
pdf: $(PDF_FILES)

# Pattern rule for pandoc with wkhtmltopdf
%.pdf: %.md $(CSS_FILE)
	@echo "Converting $< to $@..."
	@if command -v pandoc >/dev/null 2>&1; then \
		pandoc $< -o $@ \
			--pdf-engine=wkhtmltopdf \
			--css=$(CSS_FILE) \
			--metadata title="Soul Carrier Proposal" \
			-V margin-top=20mm \
			-V margin-bottom=20mm \
			-V margin-left=20mm \
			-V margin-right=20mm \
			2>/dev/null || \
		pandoc $< -o $@ \
			--pdf-engine=xelatex \
			-V geometry:margin=1in \
			-V mainfont="Noto Sans CJK JP" \
			-V monofont="Noto Sans Mono CJK JP" \
			2>/dev/null || \
		echo "pandoc conversion failed. Please install wkhtmltopdf or xelatex."; \
	elif command -v md-to-pdf >/dev/null 2>&1; then \
		md-to-pdf $< --stylesheet $(CSS_FILE); \
	else \
		echo "No PDF converter found. Please install pandoc or md-to-pdf."; \
		exit 1; \
	fi
	@echo "Created $@"

# Japanese version only
jp: soul_carrier_proposal_jp.pdf

# English version only
en: soul_carrier_proposal_en.pdf

# Clean generated PDFs (keeps original PDFs)
clean:
	rm -f $(PDF_FILES)

# Watch for changes and rebuild (requires fswatch or inotifywait)
watch:
	@echo "Watching for changes..."
	@if command -v fswatch >/dev/null 2>&1; then \
		fswatch -o $(MD_FILES) $(CSS_FILE) | xargs -n1 -I{} make pdf; \
	elif command -v inotifywait >/dev/null 2>&1; then \
		while true; do \
			inotifywait -q -e modify $(MD_FILES) $(CSS_FILE); \
			make pdf; \
		done; \
	else \
		echo "Please install fswatch or inotify-tools for watch mode."; \
	fi

# Help
help:
	@echo "Soul Carrier Proposal - Markdown to PDF Conversion"
	@echo ""
	@echo "Usage:"
	@echo "  make          - Build all PDFs"
	@echo "  make pdf      - Build all PDFs"
	@echo "  make jp       - Build Japanese PDF only"
	@echo "  make en       - Build English PDF only"
	@echo "  make clean    - Remove generated PDFs"
	@echo "  make watch    - Watch for changes and rebuild"
	@echo "  make help     - Show this help"
	@echo ""
	@echo "Prerequisites (install one of these):"
	@echo "  1. pandoc + wkhtmltopdf (recommended)"
	@echo "     brew install pandoc wkhtmltopdf"
	@echo "  2. pandoc + latex"
	@echo "     brew install pandoc && brew install --cask mactex"
	@echo "  3. md-to-pdf"
	@echo "     npm install -g md-to-pdf"

.PHONY: all pdf jp en clean watch help
