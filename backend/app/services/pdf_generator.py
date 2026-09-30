# Service for generating PDFs from Jinja2 HTML templates

import os
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

def generate_pdf(template_name: str, context: dict, output_path: str):
    """
    Renders an HTML template with the given context using Jinja2,
    and then converts the rendered HTML to a PDF using WeasyPrint.
    """
    # Get the path to the templates directory (relative to this service file)
    templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
    
    # Initialize Jinja2 environment
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template(template_name)
    
    # Render the HTML with context variables
    rendered_html = template.render(context)
    
    # Generate PDF from the rendered HTML using WeasyPrint
    # Note: WeasyPrint will need system dependencies installed (e.g. pango, cairo)
    HTML(string=rendered_html).write_pdf(output_path)
    
    return output_path
