//import { IDisposable } from '@phosphor/disposable';

//import { CommandRegistry } from '@phosphor/commands';

import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';

import { Dialog, ToolbarButton, showDialog  } from '@jupyterlab/apputils';
//Dialog, IFrame, InstanceTracker, MainAreaWidget,showDialog

//import { DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookTracker } from '@jupyterlab/notebook'; //INotebookModel, NotebookPanel

import { SubmitWidget } from './SubmitDialog'

import '../style/index.css';

/**
 * A JupyterLab extension to submit notebooks to
 * be executed in a remote platform
 */
const extension: JupyterLabPlugin<void> = {
  id: 'run-submit-extension',
  autoStart: true,
  activate: (
    app: JupyterLab,
    tracker: INotebookTracker,
  ): void => {
    // Extension initialization code


    const widget = new SubmitWidget();
    widget.id = 'submitnotebook';
    widget.title.label = 'Submit Notebook';
    widget.title.closable = true;

    // Create the on-click callback for the toolbar button.
    let submitNotebook = () => {
      dialogDemo()
    };

    function dialogDemo(): void {
      showDialog({
        title: 'Create new notebook',
        body: widget,
        buttons: [Dialog.cancelButton(), Dialog.okButton()]
      });
    }


    // Create the new toolbar submit button
    let submitNotebookButton = new ToolbarButton({
      iconClassName: 'fa fa-send',
      label: 'Submit Notebook ...',
      onClick: submitNotebook,   // load the submit widget as a dialog
      tooltip: 'Submit Notebook ...'
    });


    // Add the toolbar button to the notebook
    console.log(tracker)
    let panel = tracker.currentWidget
    panel.toolbar.insertItem(9, 'submitNotebook', submitNotebookButton);
  }
};


export default extension;
