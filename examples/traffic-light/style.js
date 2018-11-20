import {html} from 'lit-html/lit-html';

const style = html `
  <style>
    div {
      margin: 10px;
      width: 100px;
      text-align: center;
    }
    #light {
      width: 100px;
      height: 100px;
      border: 4px solid black;
      background-color: black;
      border-radius: 50%;
    }
    #light.green {
      background-color: green;
    }
    #light.red {
      background-color: red;
    }
    #light.yellow {
      background-color: yellow;
    }
  </style>
`;

export default style;
