import pathlib
d = pathlib.Path(__file__).parent
t = (d/'template.html').read_text()
t = t.replace('/*CSS*/', (d/'app.css').read_text())
t = t.replace('/*DATA*/', (d/'words.js').read_text() + '\n' + (d/'grammar.js').read_text())
t = t.replace('/*APP*/', (d/'app.js').read_text())
(d.parent/'index.html').write_text(t)
print('built', len(t), 'bytes')
