import {Dialog, showDialog, ToolbarButton} from "@jupyterlab/apputils";
import {JSONObject, JSONValue} from "@phosphor/coreutils";
import {PanelLayout, Widget} from '@phosphor/widgets';
import {DocumentRegistry} from "@jupyterlab/docregistry";
import {INotebookModel, NotebookPanel} from "@jupyterlab/notebook";
import {JupyterFrontEnd} from "@jupyterlab/application";
import {IDisposable} from "@phosphor/disposable";
import {URLExt} from "@jupyterlab/coreutils";
import {ServerConnection} from "@jupyterlab/services";

import Utils from './utils'

/**
 * Details about notebook submission configuration, including
 * details about the remote platform and any other
 * user details required to access/start the job
 */
export interface ISubmitNotebookConfiguration extends JSONObject {
  platform: string,
  endpoint: string,
  user: string,
  userinfo: string,
  framework: string,
  cpus: number,
  gpus: number,
  memory: string,
  dependencies: string,

  cos_endpoint: string,
  cos_user: string,
  cos_password: string,
  cos_bucket_in: string,
  cos_bucket_out: string,

  env: { [index: string]: string }
}

/**
 * Details about notebook submission task, includes the submission
 * configuration plus the notebook contents that is being submitted
 */
export interface ISubmitNotebookTask extends ISubmitNotebookConfiguration {
  kernelspec: string,
  notebook_name: string,
  notebook: JSONValue,
}

/**
 * Submit notebook button extension
 *  - Attach button to notebook toolbar and launch a dialog requesting
 *  information about the remote location to where submit the notebook
 *  for execution
 */
export class SubmitNotebookButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private panel: NotebookPanel;

  constructor(app: JupyterFrontEnd) {
    this.app = app;
  }

  readonly app: JupyterFrontEnd;

  showWidget = () => {
    let envVars: string[] = Utils.getEnvVars(this.panel.content.model.toString());

    showDialog({
      title: 'Submit notebook',
      body: new SubmitNotebook(envVars),
      buttons: [Dialog.cancelButton(), Dialog.okButton()]
    }).then( result => {
      if( result.value == null) {
        // When Cancel is clicked on the dialog, just return
        return;
      }

      // prepare notebook submission details
      let notebookTask: ISubmitNotebookTask = <ISubmitNotebookTask> result.value;

      notebookTask.kernelspec = "python3";
      notebookTask.notebook_name = "---";
      notebookTask.notebook = this.panel.content.model.toJSON();

      // use ServerConnection utility to make calls to Jupyter Based services
      // which in this case is the scheduler extension installed by this package
      let settings = ServerConnection.makeSettings();
      let url = URLExt.join(settings.baseUrl, 'scheduler');
      let requestBody = JSON.stringify(notebookTask);

      ServerConnection.makeRequest(url, { method: 'POST', body: requestBody }, settings)
        .then(response => {
          if (response.status !== 200) {
            return response.json().then(data => {
              showDialog({
                title: "Error submitting Notebook !",
                body: data.message,
                buttons: [Dialog.okButton()]
              })
            });
          }
          return response.json();
        })
        .then(data => {
          if( data ) {
            let dialogTitle: string = 'Job submission to ' + result.value.platform;
            let dialogBody: string = '';
            if (data['status'] == 'ok') {
              dialogTitle =  dialogTitle + ' succeeded !';
              dialogBody = 'Check details on submitted jobs at : <br> <a href=' + data['url'].replace('/&', '&') + ' target="_blank">Console & Job Status</a>';
            } else {
              dialogTitle =  dialogTitle + ' failed !';
              dialogBody = data['message'];
            }
            showDialog({
              title: dialogTitle,
              body: dialogBody,
              buttons: [Dialog.okButton()]
            })
          }
        });
      });
  };

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    this.panel = panel;

    // Create the toolbar button
    let submitNotebookButton = new ToolbarButton({
      iconClassName: 'fa fa-send',
      label: 'Submit Notebook ...',
      onClick: this.showWidget,
      tooltip: 'Submit Notebook ...'
    });

    // Add the toolbar button to the notebook
    panel.toolbar.insertItem(9, 'submitNotebook', submitNotebookButton);

    // The ToolbarButton class implements `IDisposable`, so the
    // button *is* the extension for the purposes of this method.
    return submitNotebookButton;
  }
}

/**
 * Submit notebook dialog extension
 * - Request information about the remote location to where submit the
 * notebook for execution
 */
export class SubmitNotebook extends Widget implements Dialog.IBodyWidget<ISubmitNotebookConfiguration>  {
  private _htmlDialogElement: HTMLElement;
  _envVars: string[];

  constructor(envVars: string[]) {
    super();

    this._envVars = envVars;

    this._htmlDialogElement = this.renderHtml();

    let layout = (this.layout = new PanelLayout());

    layout.addWidget(new Widget( {node: <HTMLElement> this._htmlDialogElement.firstElementChild }))
  }

  /**
   * Render the dialog widget used to gather configuration information
   * required to submit/run the notebook remotely
   */
  renderHtml() {
    var tr = '<tr style="padding: 1px;">';
    var td = '<td style="padding: 1px;">';
    //var td_colspan2 = '<td style="padding: 1px;" colspan=2>';
    var td_colspan3 = '<td style="padding: 1px;" colspan=3>';
    //var td_colspan4 = '<td style="padding: 1px;" colspan=4>';

    var content = ''
    +'<table id="table-submit-dialog"><tbody>'

    + tr
    + td
    +'<label for="platform">Platform:</label>'
    +'<br/>'
    +'<select id="platform"><option value="jupyter">Jupyter</option><option value="docker">Docker</option><option value="dlaas">DLAAS</option><option value="ffdl" selected>FfDL</option></select>'
    +'</td>'

    + td_colspan3
    +'<label for="endpoint">Platform API Endpoint:</label>'
    +'<br/>'
    +'<input type="text" id="endpoint" name="endpoint" placeholder="##########" value="##########" size="65"/>'
    +'</td>'
    +'</tr>'

    + tr
    + td
    +'<label for="framework">Deep Learning Framework:</label>'
    +'<br/>'
    +'<select id="framework"><option value="tensorflow" selected>Tensorflow</option><option value="caffe">Caffe</option><option value="pytorch">PyTorch</option><option value="caffe2">Caffe2</option></select>'
    +'</td>'

    + td
    +'<label for="cpus">CPUs:</label>'
    +'<br/>'
    +'<input type="text" id="cpus" name="cpus" placeholder="1" value="1"/>'
    +'</td>'

    + td
    +'<label for="gpus">GPUs:</label>'
    +'<br/>'
    +'<input type="text" id="gpus" name="gpus" placeholder="0" value="0"/>'
    +'</td>'

    + td
    +'<label for="memory">Memory:</label>'
    +'<br/>'
    +'<input type="text" id="memory" name="memory" placeholder="1Gb" value="1Gb"/>'
    +'</td>'
    +'</tr>'

    + tr
    + td
    +'<label for="user">User:</label>'
    +'<br/>'
    +'<input type="text" id="user" name="user" placeholder="##########" value="##########"/>'
    +'</td>'

    + td_colspan3
    +'<label for="userinfo">User/Instance information:</label>'
    +'<br/>'
    +'<input type="text" id="userinfo" name="userinfo" placeholder="##########" value="##########" size="35"/>'
    +'</td>'
    +'</tr>'

    + tr
    + td_colspan3
    +'<label for="cos_endpoint">COS Endpoint:</label>'
    +'<br/>'
    +'<input type="text" id="cos_endpoint" name="cos_endpoint" placeholder="##########" value="##########" size="65"/>'
    +'</td>'

    + td
    +'</td>'
    +'</tr>'

    + tr
    + td
    +'<label for="cos_user">COS User:</label>'
    +'<br/>'
    +'<input type="text" id="cos_user" name="cos_user" placeholder="##########" value="##########" size="20"/>'
    +'</td>'

    + td
    +'<label for="cos_password">COS Password:</label>'
    +'<br/>'
    +'<input type="password" id="cos_password" name="cos_password" placeholder="##########" value="##############" size="20"/>'
    +'</td>'

    + td
    +'<label for="cos_bucket_in">COS Input Bucket Name:</label>'
    +'<br/>'
    +'<input type="text" id="cos_bucket_in" name="cos_bucket_in" placeholder="##########" value="##########" size="20"/>'
    +'</td>'

    + td
    +'<label for="cos_bucket_out">COS Output Bucket Name:</label>'
    +'<br/>'
    +'<input type="text" id="cos_bucket_out" name="cos_bucket_out" placeholder="##########" value="##########" size="20"/>'
    +'</td>'

    +'</tr>'

    + tr
    + td
    +'<br/>'
    +'<input type="checkbox" id="dependency_include" name="dependency_include" value="true" size="20"/> Include dependencies<br/>'
    +'</td>'

    + td
    +'<br/>'
    +'<input type="text" id="dependencies" name="dependencies" placeholder="*.py" value="*.py" size="20"/>'
    +'</td>'

    +'</tr>'

    + this.getEnvHtml()

    +'</tbody></table>'

    let htmlContent = document.createElement('div');
    htmlContent.innerHTML = content;

    return htmlContent;
  }

  getEnvHtml(): string {
    let tr = '<tr style="padding: 1px;">';
    let td = '<td style="padding: 1px;">';
    let td_colspan4 = '<td style="padding: 1px;" colspan=4>';
    let subtitle = '<div style="font-size: var(--jp-ui-font-size3)">Environmental Variables</div>'

    let html = '' + tr + td_colspan4 + subtitle + '</td>' + '</tr>';

    for (let i = 0; i < this._envVars.length; i++) {

      if (i % 4 === 0) {
        html = html + tr;
      }

      html = html + td
        +`<label for="envVar${i}">${this._envVars[i]}:</label>`
        +'<br/>'
        +`<input type="text" id="envVar${i}" class="envVar" name="envVar${i}" placeholder="" value="" size="20"/>`
        +'</td>';

      if (i % 4 === 3) {
        html = html + '</tr>';
      }
    }


    return html;
  }

  getValue(): ISubmitNotebookConfiguration {

    let dependency_list = '';
    if ((<HTMLInputElement> document.getElementById('dependency_include')).value == "true") {
      dependency_list = (<HTMLInputElement>document.getElementById('dependencies')).value
    }

    let envVars: { [index: string]: string } = {};

    let envElements = document.getElementsByClassName('envVar');

    for (let i = 0; i < envElements.length; i++) {
      let index: number  = parseInt(envElements[i].id.match(/\d+/)[0], 10);
      envVars[this._envVars[index]] = (<HTMLInputElement>envElements[i]).value;
    }

    let returnData: ISubmitNotebookConfiguration = {
      platform: (<HTMLSelectElement> document.getElementById('platform')).value,
      endpoint: (<HTMLInputElement> document.getElementById('endpoint')).value,
      user: (<HTMLInputElement>document.getElementById('user')).value,
      userinfo: (<HTMLInputElement>document.getElementById('userinfo')).value,
      framework: (<HTMLSelectElement> document.getElementById('framework')).value,
      cpus: Number((<HTMLInputElement>document.getElementById('cpus')).value),
      gpus: Number((<HTMLInputElement>document.getElementById('gpus')).value),
      memory: (<HTMLInputElement>document.getElementById('memory')).value,
      dependencies: dependency_list,

      cos_endpoint: (<HTMLInputElement>document.getElementById('cos_endpoint')).value,
      cos_user: (<HTMLInputElement>document.getElementById('cos_user')).value,
      cos_password: (<HTMLInputElement>document.getElementById('cos_password')).value,
      cos_bucket_in: (<HTMLInputElement>document.getElementById('cos_bucket_in')).value,
      cos_bucket_out: (<HTMLInputElement>document.getElementById('cos_bucket_out')).value,

      env: envVars,
    };

    return returnData;
  }
}
