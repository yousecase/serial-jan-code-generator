import React from 'react';
import JANCodeGenerator from './JANCodeGenerator';

const style: React.CSSProperties = {
  width: '300px',
  margin: '10px'
};

// propsとstateで利用するプロパティ名
enum PropName {
  JANCode = 'JANCode',
  quantity = 'quantity',
  JANCodeListString = 'JANCodeListString'
}

interface PropType {
  [PropName.JANCode]?: string;
  [PropName.quantity]?: string;
}

interface StateType {
  [PropName.JANCode]: string;
  [PropName.quantity]: string;
  [PropName.JANCodeListString]: string;
}

export default class App extends React.Component<PropType, StateType> {
  constructor(props: PropType) {
    super(props);

    const { [PropName.JANCode]: JANCode = '', [PropName.quantity]: quantity = '' }:
      { [PropName.JANCode]?: string, [PropName.quantity]?: string } = props;

    this.state = {
      [PropName.JANCode]: JANCode,
      [PropName.quantity]: quantity, // TODO: 下記のMAX_QUANTITYを超える場合がある
      [PropName.JANCodeListString]: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.generateSerialJANCode = this.generateSerialJANCode.bind(this);
  }

  private readonly MAX_JANCODE_Digit: number = 13;
  private readonly MAX_QUANTITY: number = 100_000; // 暫定値

  // 各フォームの入力値を検証してstateに格納する
  private handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    switch (e.target.name) {
      case PropName.JANCode: {
        const oldJANCode: string = this.state[PropName.JANCode];
        let newJANCode: string = e.target.value;
        if (this.MAX_JANCODE_Digit < newJANCode.length) {
          newJANCode = oldJANCode;
        }
        this.setState({ [PropName.JANCode]: newJANCode });
        break;
      }
      case PropName.quantity: {
        const oldQuantity: string = this.state[PropName.quantity];
        let newQuantity: string = e.target.value;
        const newQuantityInt: number = parseInt(newQuantity);
        if (!isNaN(newQuantityInt) && this.MAX_QUANTITY < newQuantityInt) {
          newQuantity = oldQuantity;
        }
        this.setState({ [PropName.quantity]: newQuantity });
        break;
      }
    }
  }

  private generateSerialJANCode(): void {
    this.setState({
      [PropName.JANCodeListString]:

        // JANCodeの生成
        JANCodeGenerator
          .getSerialJANCodeList(parseInt(this.state[PropName.JANCode]),
            parseInt(this.state[PropName.quantity]))

          // JANCode桁数を8桁・13桁に揃える
          .map(value => JANCodeGenerator.format(value))

          // 結合
          .join('\n')
    });
  }

  render(): JSX.Element {
    return (
      <div className="card" style={style}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor={PropName.JANCode}>JANCode</label>
            <input type="number" value={this.state[PropName.JANCode]}
              onChange={this.handleChange} className="form-control"
              name={PropName.JANCode} id={PropName.JANCode} />
          </div>
          <div className="form-group">
            <label htmlFor={PropName.quantity}>Quantity (Max: {this.MAX_QUANTITY})</label>
            <input type="number" value={this.state[PropName.quantity]}
              onChange={this.handleChange} className="form-control"
              name={PropName.quantity} id={PropName.quantity} />
          </div>
          <div className="form-group">
            <button type="submit" onClick={this.generateSerialJANCode}
              className="btn btn-primary">Submit</button>
          </div>
          <div className="form-group">
            <label htmlFor="OutputTextarea">Result</label>
            <textarea className="form-control" id="OutputTextarea"
              rows={10} defaultValue={this.state[PropName.JANCodeListString]}></textarea>
          </div>
        </div>
      </div>
    );
  }
}