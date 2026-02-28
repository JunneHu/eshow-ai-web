import React, { Component } from 'react';
import { Button } from 'antd';

import "./base.less";

class Page500 extends Component {
    goHome = () => {
        // service.loginOut();
        try {
            window.location.href = window.configs.host.main;
        }
        catch(e) {
            window.location.href="/";
        }
    }

    render() {
        return (
            <div className="ex_container" style={{ textAlign: 'center' }}>
                <div className="spirit500"></div>
                <b style={{ display: 'block', marginTop: 20 }}>抱歉,服务器出错</b>
                <div style={{ marginTop: 15 }}>
                    <Button type="primary" onClick={ this.goHome }>返回首页</Button>
                </div>
            </div>
        );
    }
}

export default Page500;