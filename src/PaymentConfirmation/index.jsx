import React from 'react';
import { WingBlank, InputItem, Button, Card, List, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import './index.less'
import weHeader from './wxJSDK'
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    // onTouchStart: e => e.preventDefault(),
  };
}
const Item = List.Item;

class PaymentConfirmation extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
        FACE_AMOUNT: ''
        
    }
    this.BILL_ID = ''
  }
  getFixed(num, deci) {
    return num.toFixed(deci || 2);
  }
  componentDidMount(){
      weHeader('init');
      let FACE_AMOUNT = parseFloat(this.props.match.params.FACE_AMOUNT);
      this.setState({
        FACE_AMOUNT: `￥${this.getFixed(FACE_AMOUNT)}`
      })
  }
  onSubmit = () => {
    let paramField = this.props.form.getFieldsValue();
    paramField.FACE_AMOUNT = this.props.match.params.FACE_AMOUNT;
    for (const key in paramField) {
      if (paramField[key] == undefined) {
        paramField[key] = ''
      }
    }
    /**
     * 验证手机
     */
    paramField.MEME_PHONE = paramField.MEME_PHONE.replace(/\s/g, "");
    if (paramField.MEME_PHONE && !this.checkPhone(paramField.MEME_PHONE)) {
      Toast.fail('手机号码格式不正确', 1)
      return
    }
    /**
     * 校验身份ID
     */
    if (paramField.MEME_CERT_NUMBER_ID && !this.checkId(paramField.MEME_CERT_NUMBER_ID)) {
      Toast.fail('身份证格式不正确', 1)
      return
    }
    paramField.m = "INSERT";
    paramField.DB_NAME = "DENTAL_SHOP";
    paramField.SP_NAME = "SP_SHOP_BILL_FACE_BATCH_UPDATE";

    Toast.loading('发起支付中,请稍后...', 0);
    React.axios({
      method: 'post',
      url: '../../base/request',
      data: qs.stringify(paramField)
    }).then(res=>{
        if (!res.data.RETURN_CODE) {
          if (!this.BILL_ID) {
              this.BILL_ID = res.data.BILL_ID;
          }
          Toast.hide()
          window.location.href = '../../UnifiedPay/' + this.BILL_ID
        } else {
          Toast.hide()
          Toast.fail(res.data.RETURN_MESSAGE, 1);
        }
    })

  }
  checkPhone(str){
    return /^1[3|4|5|6|7|8][0-9]{9}$/.test(str);
  }
  checkId(str){
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str);
  }
  render(){
    const { getFieldProps } = this.props.form;
    return (
      <div className="container">
        
        <div className="content">
          <WingBlank>
          <h1 className="Title">收款</h1>
          <Card>
            <Card.Header
              className="cardTitle"
              title="全齿健平台"
            />
            <Card.Body className="paymentCardBody">
                <List className="my-list">
                    <Item className="paymentTitle" extra={this.state.FACE_AMOUNT}>需收款</Item>
                </List>
                
                <List className="formSubmit" renderHeader={() => '个人信息'}>
                    <InputItem
                        {...getFieldProps('MEME_NAME')}
                        type="text"
                        placeholder="姓名"
                        className="labelName"
                    >使用人姓名</InputItem>
                    <InputItem
                        {...getFieldProps('MEME_PHONE')}
                        type="phone"
                        placeholder="联系方式"
                        className="labelName"
                    >手机号码</InputItem>
                    <InputItem
                        {...getFieldProps('MEME_CERT_NUMBER_ID')}
                        type="text"
                        placeholder="证件号"
                        className="labelName"
                    >证件号</InputItem>
                    
                    <InputItem
                        {...getFieldProps('REF_CODE')}
                        type="text"
                        placeholder="推荐码"
                        className="labelName"
                    >推荐码</InputItem>
                </List>
            </Card.Body>
            
          </Card>

          <Button className="NextStep submit" onClick={this.onSubmit}  >确认收款</Button>
          <Button className="NextStep" onClick={() => {this.props.history.push('/')}}  >返回</Button>
          </WingBlank>
        </div>
      </div>
    )
  }  
}


export default createForm()(PaymentConfirmation)

/**
 * * 初始项目该字段功能因超出屏出现滚动条而取消，后续如如有需求可复制添加
 * * 时间 2019-12-03 14:34
 */
/* <InputItem
    {...getFieldProps('MEME_ADDRESS')}
    type="text"
    placeholder="地址"
    className="labelName"
>地址</InputItem>
<InputItem
    {...getFieldProps('MEME_ZIPCODE')}
    type="text"
    placeholder="邮编"
    className="labelName"
>邮编</InputItem> */