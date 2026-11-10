# Builds the single-file prototype from src/ (no dependencies).
import pathlib
d = pathlib.Path(__file__).parent / 'src'
html = (d / 'shell.html').read_text(encoding='utf-8')
css = (d / 'styles.css').read_text(encoding='utf-8')
js = '\n'.join((d / f).read_text(encoding='utf-8') for f in ['data.js', 'requirements.js', 'core.js', 'pages1.js', 'pages2.js']) + '\nboot();\n'
out = html.replace('/*CSS*/', css).replace('/*JS*/', js)
p = d.parent / 'PMB_Delight_Module_Prototype.html'
p.write_text(out, encoding='utf-8')
print(p, len(out))
