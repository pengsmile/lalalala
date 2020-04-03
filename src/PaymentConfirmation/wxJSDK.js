import qs from 'qs'
import axios from 'axios'

function isFunction() {  
    return Object.prototype.toString.call(val) === '[object Function]'
}

 //share:分享连接  ，mpPay 发起支付，viewMap 查看地图
export default function wxHelper(options) {
    var _arguments = arguments;
    var jsApiList = null;
    var modules = {
        init: function () {
            var _init = function (wxTicket) {
                // var params = $.extend({}, wxTicket);
                var params = Object.assign({}, wxTicket)
                params.jsApiList = ["openLocation", "chooseWXPay", "openAddress", "onMenuShareAppMessage", "chooseCard", "addCard"];
                params.debug = false;
                wx.config(params);

                if (typeof (WX_STARTUP_INVOKE) != "undefined" && isFunction(WX_STARTUP_INVOKE)) {
                    WX_STARTUP_INVOKE();
                }
            }

            if (typeof (wxTicket) == "undefined") {
                axios.get('../../wx/getJsTicket').then(res=>{
                    _init(res)
                })
                // $.get("../wx/getJsTicket",
                //     function (params) {
                //         ;
                //     }

                // );
            }
            else {
                _init(wxTicket);
            }



        },
        viewMap: function (point, name) {
            if (point == "") {
                return;
            }
            point = point.split(",")
            var latitude = point[1];
            var longitude = point[0];

            wx.checkJsApi({
                jsApiList: ['openLocation'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function (res) {

                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                    if (res.checkResult.openLocation) {

                        wx.openLocation({
                            latitude: parseFloat(latitude), // 纬度，浮点数，范围为90 ~ -90
                            longitude: parseFloat(longitude), // 经度，浮点数，范围为180 ~ -180。
                            name: name, // 位置名
                            address: '', // 地址详情说明
                            scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
                            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
                        });
                    }
                    else {
                        throw "地图组件调用失败";
                    }
                }
            });

        },
        mpPay: function (bill_id, success, cancel, fail) {
            axios({
                method: 'post',
                url: '../../wx/CallMPPay',
                data: qs.stringify({
                    BILL_ID: bill_id
                })
            }).then(res=>{
                var payParams = res.data;
                if (payParams.RETURN_CODE) {
                    fail && fail(payParams.RETURN_MESSAGE);
                    return;
                }
                payParams.timestamp = payParams.timeStamp;
                payParams.fail = function () {
                    fail && fail("支付接口调用失败");
                };
                payParams.success = success;
                payParams.cancel = cancel;
                wx.chooseWXPay(
                     payParams
                 );
            })
            // $.post(
            //        "../wx/CallMPPay",
            //        {  },
            //        function (payParams) {
            //            if (payParams.RETURN_CODE) {
            //                fail && fail(payParams.RETURN_MESSAGE);
            //                return;
            //            }
            //            payParams.timestamp = payParams.timeStamp;
            //            payParams.fail = function () {
            //                fail && fail("支付接口调用失败");
            //            };
            //            payParams.success = success;
            //            payParams.cancel = cancel;
            //            wx.chooseWXPay(
            //                 payParams
            //             );
            //        }
            //    )
        },
        h5Pay: function (bill_id, status, cb) {
            axios({
                method: 'post',
                url: '../wx/CallH5Pay',
                data: qs.stringify({ BILL_ID: bill_id, STATUS: status })
            }).then(payParams=>{
                cb && cb(payParams);
            })
            // $.post(
            //        "../wx/CallH5Pay",
            //        { BILL_ID: bill_id, STATUS: status },
            //        function (payParams) {
            //            //payParams -> mweb_url ; location= mweb_url
            //            cb && cb(payParams);
            //        }
            //    )
        },
        h5UnifiedPay: function (bill_id, cb) {
            axios({
                method: 'post',
                url: '../wx/CallCBCH5Pay',
                data: qs.stringify({ BILL_ID: bill_id })
            }).then(payParams=>{
                cb && cb(payParams);
            });

            // $.post(
            //        "../wx/CallCBCH5Pay",
            //        { BILL_ID: bill_id },
            //        function (payParams) {
            //            cb && cb(payParams);
            //        }
            //    )   
        },
        share: function (item) {

            wx.checkJsApi({
                jsApiList: ['onMenuShareAppMessage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function (res) {
                    alert(JSON.stringify(item))
                    wx.onMenuShareAppMessage({
                        title: item.GOODS_DESC, // 分享标题
                        desc: item.INTRO, // 分享描述
                        link: 'http://interface.qdental.cn/MPShopMall/ItemDetail/' + item.GOODS_ID, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: item.imgUrl, // 分享图标
                        type: 'link', // 分享类型,music、video或link，不填默认为link
                        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function () {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function () {
                            // 用户取消分享后执行的回调函数
                        },
                        fail: function () {
                            throw "分享接口调用失败";

                        }
                    });
                }
            });

        },
        getAddress: function (callback) {
            wx.openAddress({
                success: function (res) {
                    //                    var userName = res.userName; // 收货人姓名
                    //                    var postalCode = res.postalCode; // 邮编
                    //                    var provinceName = res.provinceName; // 国标收货地址第一级地址（省）
                    //                    var cityName = res.cityName; // 国标收货地址第二级地址（市）
                    //                    var countryName = res.countryName; // 国标收货地址第三级地址（国家）
                    //                    var detailInfo = res.detailInfo; // 详细收货地址信息
                    //                    var nationalCode = res.nationalCode; // 收货地址国家码
                    //                    var telNumber = res.telNumber; // 收货人手机号码
                    callback && callback(res)
                },
                fail: function () {
                    throw "获取手机姓名失败";
                }
            });
        },
        chooseCard: function (success, fail) {
            axios({
                method: 'post',
                url: '../api/Card/ChooseCard',
                data: qs.stringify({})
            }).then(ret=>{
                if (!ret.RETURN_ERROR) {
                    var cfg = ret.result;
                    cfg.success = function (ret) {
                        success && success(ret);
                    }
                    wx.chooseCard(cfg);
                }
                else {
                    fail && fail(ret.RETURN_ERROR_MESSAGE);
                }
            });

            // $.post(
            //        "../api/Card/ChooseCard",
            //        function (ret) {
            //            if (!ret.RETURN_ERROR) {
            //                var cfg = ret.result;
            //                cfg.success = function (ret) {
            //                    success && success(ret);
            //                }
            //                wx.chooseCard(cfg);
            //            }
            //            else {
            //                fail && fail(ret.RETURN_ERROR_MESSAGE);
            //            }
            //        }
            //    )

        },
        addCard: function (cardList, cb) {
            wx.addCard({
                cardList: cardList, // 需要添加的卡券列表
                success: function (res) {
                    var sel_cardList = res.cardList; // 添加的卡券列表信息
                    if (cb) {
                        cb(sel_cardList);
                    }
                }
            });
        }
    };

        if (typeof (options) == "string") {
        var method = modules[options];
        if (method) {
            return method.apply(this, Array.prototype.slice.call(_arguments, 1));
        }
    }
    else {
        return "";
    }
}

