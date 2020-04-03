import React from 'react';
import { WingBlank, Button, Card, List, ListView, Icon, Toast, Result } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import './index.less'

const Item = List.Item;

class PayHistory extends React.Component {
  
  constructor(props){
    super(props)
    // const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
    // const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];
    
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    
    this.state = {
      dataSource: ds,
      isLoading: true,
      // height: document.documentElement.clientHeight * 3 / 4,
      pageIndex: 1,
      pageRow: 10,
      list: {}
    };
  }
  componentDidMount(){
      // 初始首次加载
      this.update()
  }
  /**
   * @param {String} param 用于区分首次加载和滚屏加载
   */
  update(param){
      Toast.loading('加载中', 0);
      React.axios({
        method: 'post',
        url: '../../base/request',
        data: qs.stringify({
            m : "LIST",
            DB_NAME:"DENTAL_SHOP",
            SP_NAME:"SP_SHOP_BILL_FACE_DISPLAY_LIST",
            page: this.state.pageIndex,
            rows: this.state.pageRow
        })
      }).then(res=>{
        Toast.hide()
        res.data.pageNum = this.state.pageIndex;
        let pageCount = this.pageCount(res.data.total, this.state.pageRow);
        res.data.totalNum = pageCount;
        if (param) {
            let data = res.data;
            data.rows = this.state.list.rows.concat(res.data.rows);
            // cloneWithRowsAndSections
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(data.rows),
              list: data,
              isLoading: false
            })
        } else {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(res.data.rows),
              list: res.data,
              isLoading: false
            })
        }
        
      })
  }
  onResult = () => {
      this.props.history.push('/')
  }
  // 滚动底部 触发事件
  onEndReached = (page, total) => {
    
    if (this.state.isLoading) {
      return;
    }
    let pageCount = this.pageCount(total, this.state.pageRow);
    if (Number(this.state.pageIndex) < Number(pageCount)) {
        this.setState({ isLoading: true })
        this.state.pageIndex++
        this.update('update')
    }
  }

  //获取item进行展示
  renderRow = (item, id1, i) => {
    console.log(item)
    return (
      <Card key={i} className="payHistoryItem">
          <Card.Header
          title='支付金额'
          extra={'￥' + item.FACE_AMT}
          />
          <Card.Body>
              <div className="preBody">
                  <div className="preItem">
                      <label class="preLabel">姓名</label>
                      <span class="preValue">{item.MEME_NAME}</span>
                  </div>
                  <div className="preItem">
                      <label class="preLabel">联系方式</label>
                      <span class="preValue">{item.MEME_PHONE}</span>
                  </div>
                  <div className="preItem">
                      <label class="preLabel">证件号</label>
                      <span class="preValue">{item.MEME_CERT_NUMBER_ID}</span>
                  </div>
                  <div className="preItem">
                      <label class="preLabel">订单号</label>
                      <span class="preValue">{item.BILL_ID}</span>
                  </div>
                  <div className="preItem">
                      <label class="preLabel">支付时间</label>
                      <span class="preValue">{item.INCOME_DATE}</span>
                  </div>
                  
              </div>
          </Card.Body>
      </Card>
    );
  }
  /**
   * 
   * @param {Number} totalnum 总条数
   * @param {Numer} limit  每页个数
   * @return 总页数
   */
  pageCount (totalnum,limit){
        return totalnum > 0 ? ((totalnum < limit) ? 1 : ((totalnum % limit) ? (parseInt(totalnum / limit) + 1) : (totalnum / limit))) : 0;
    }
  render(){

    const { list, dataSource, isLoading } = this.state;
    // dataSource.cloneWithRows(list.rows)
    return (
      <div className="container">
        
        <div className="content PayHistoryContent">
          <WingBlank className="wingblacnk">
          <h1 className="Title">支付记录</h1>
          <Card className="payHistoryCard">
            <Card.Header
              className="cardTitle"
              title="全齿健平台"
            />
            <Card.Body className="paymentHistoryCardBody">
                {
                  list && list.rows && list.rows.length ?
                    <ListView
                      className="ListView"
                      dataSource={dataSource}
                      renderRow={this.renderRow}
                      initialListSize={10}
                      pageSize={5}
                      style={{
                        height: '100%',
                        overflow: 'auto',
                      }}
                      renderFooter={() => (
                        <div style={{ padding: 30, textAlign: 'center' }}>
                      { (list.pageNum < list.totalNum) && isLoading ? <Icon type="loading" /> + '正在加载更多的数据...' : '已经全部加载完毕'}
                        </div>)
                      }
                      onEndReached={() => this.onEndReached(list.pageNum, list.total)}
                      scrollRenderAheadDistance={500}
                    />
                    :
                    list && list.rows && !list.rows.length ?
                      <Result
                        title="暂无记录"
                        message="支付暂无记录"
                      /> : null
                }
            </Card.Body>
            
          </Card>


          </WingBlank>
        </div>
        <div className="footer">
            <WingBlank>
                <Button className="NextStep submit" onClick={this.onResult}  >返回</Button>
            </WingBlank>
            
        </div>
      </div>
    )
  }  
}

export default createForm()(PayHistory)

/**
 * 地址显示 移除 
 * 时间 2019-12-04
 */
// <div className="preItem">
//     <label class="preLabel">地址</label>
//     <span class="preValue">{item.MEME_ADDRESS}</span>
// </div>