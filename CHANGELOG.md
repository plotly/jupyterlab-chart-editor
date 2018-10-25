# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2018-10-25
Initial stable release of the `jupyterlab-chart-editor` extension
for editing plotly charts in JupyterLab

### Added
 - Extension registers itself as a mime-type renderer for files with the
 `'.plotly'` and `'.plotly.json'` extension. These files can be created from
 Python using the `plotly.io.write_json` function in
 [plotly.py](https://github.com/plotly/plotly.py) version 3.3.0+.
 - Edited charts can be saved back to the same file, or saved as a new file
 using the standard "File->Save" and "File->Save As" menu commands.