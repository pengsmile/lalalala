import React from 'react';
import ReactDOM from 'react-dom';
import '@/lib/flexible.js'

import '@/lib/instrumentMobai.css'
import '@/lib/PublicBase.css'

import '@/index.css';

import Index from './main/App'; // 收款页
import PaymentConfirmation from './PaymentConfirmation' // 提交个人信息
import PayHistory from './PayHistory' // 支付记录
import { HashRouter as Router , Route } from 'react-router-dom'
import axios from 'axios'

React.axios = axios

function App () {  
    return (
        <div className="App">
            
            <Router>
                <Route exact path="/" component={Index} />
                <Route exact path="/payment/:FACE_AMOUNT" component={PaymentConfirmation} />
                <Route exact path="/payhistory" component={PayHistory} />
            </Router>
        </div>
    )
}
window.onload = function () {  
    ReactDOM.render(<App />, document.getElementById('root'));
}

// <Route exact path="/channel/:KEY" component={NewChannel} />


