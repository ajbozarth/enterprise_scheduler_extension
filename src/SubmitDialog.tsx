import * as React from 'react';
import {ReactElementWidget} from "@jupyterlab/apputils";

//import './SubmitTable.css';

interface IState {
  platform: string,
  endpoint: string,
  user: string,
  userinfo: string,
  framework: string,
  cpus: number,
  gpus: number,
  memory: number,

  cos_endpoint: string,
  cos_user: string,
  cos_password: string,
}

export class SubmitDialogComponent extends React.Component {

  public state: IState = {
    platform: 'ffdl',
    endpoint: '##########',
    user: '##########',
    userinfo: '##########',
    framework: 'tensorflow',
    cpus: 1,
    gpus: 0,
    memory: 1,

    cos_endpoint: '##########',
    cos_user: '##########',
    cos_password: '##########',
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handlingChange ==> " + event.target.name + " -> " + event.target.value)

    const userInput = event.target.value;
    this.setState({ userInput });
  }

  getValue() {
    return this.state;
  }

  render() {
    return (
      <table>
        <tbody>
        <tr>
          <td>
            <label htmlFor="platform">Platform:</label>
            <br/>
            <select id="platform" defaultValue="ffdl">
              <option value="jupyter">Jupyter</option>
              <option value="docker">Docker</option>
              <option value="dlaas">DLAAS</option>
              <option value="ffdl">FfDL</option>
            </select>
          </td>
          <td colSpan={3}>
            <label htmlFor="endpoint">Platform API Endpoint:</label>
            <br/>
            <input type="text" id="endpoint" name="endpoint" placeholder="##########"
                   defaultValue="#############"/>
          </td>
        </tr>

        <tr>
          <td>
            <label htmlFor="framework">Deep Learning Framework:</label>
            <br/>
            <select id="framework" defaultValue="tensorflow">
              <option value="tensorflow">Tensorflow</option>
              <option value="caffe">Caffe</option>
              <option value="pytorch">PyTorch</option>
              <option value="caffe2">Caffe2</option>
            </select>
          </td>
          <td>
            <label htmlFor="framework-cpus">CPUs:</label>
            <br/>
            <input type="text" id="framework-cpus" name="framework-cpus" placeholder="1" defaultValue="1"/>
          </td>
          <td>
            <label htmlFor="framework-gpus">GPUs:</label>
            <br/>
            <input type="text" id="framework-gpus" name="framework-gpus" placeholder="0" defaultValue="0"/>
          </td>
          <td>
            <label htmlFor="framework-memory">Memory:</label>
            <br/>
            <input type="text" id="framework-memory" name="framework-memory" placeholder="1Gb"
                   defaultValue="1Gb"/>
          </td>
        </tr>

        <tr>
          <td>
            <label htmlFor="framework-user">User:</label>
            <br/>
            <input type="text" id="framework-user" name="framework-user" placeholder="##########"
                   defaultValue="#############"/>
          </td>
          <td colSpan={3}>
            <label htmlFor="framework-userinfo">User/Instance information:</label>
            <br/>
            <input type="text" id="framework-userinfo" name="framework-userinfo" placeholder="##########"
                   defaultValue="#############"/>
          </td>
        </tr>

        <tr>
          <td colSpan={4}>
            <label htmlFor="cos_endpoint">COS Endpoint:</label>
            <br/>
            <input type="text" id="cos_endpoint" name="cos_endpoint" placeholder="##########"
                   defaultValue="#############"/>
          </td>
        </tr>

        <tr>
          <td>
            <label htmlFor="cos_user">COS User:</label>
            <br/>
            <input type="text" id="cos_user" name="cos_user" placeholder="##########"
                   defaultValue="##############t"/>
          </td>
          <td>
            <label htmlFor="cos_password">COS Password:</label>
            <br/>
            <input type="password" id="cos_password" name="cos_password" placeholder="##########"
                   defaultValue="##############"/>
          </td>
          <td colSpan={2}/>
        </tr>

        <tr>
          <td>
            <br/>
            <input type="checkbox" id="dependency_include" name="dependency_include" value="true"
            /> Include dependencies<br/>
          </td>
          <td>
            <br/>
            <input type="text" id="dependency_list" name="dependency_list" placeholder="*.py"
                   defaultValue="*.py"/>
          </td>
        </tr>

        </tbody>
      </table>
    );
  }
}


/**
 * Phosphor Widget
 */
export class SubmitWidget extends ReactElementWidget {
  constructor() {
    super(<SubmitDialogComponent />);
  }
}