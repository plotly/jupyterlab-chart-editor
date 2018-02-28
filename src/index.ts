import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the jupyterlab-chart-editor extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-chart-editor',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab-chart-editor is activated!');
  }
};

export default extension;
