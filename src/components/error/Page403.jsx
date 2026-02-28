
import React, { Component } from "react";
import { Button } from "antd";
// import service from '../utils/service';
import "./base.less";

class Page403 extends Component {
  goHome = () => {
    // service.loginOut();
    console.log("goHome", window.configs.host.main);

    try {
      window.location.href = window.configs.host.main;
    } catch (e) {
      window.location.href = "/";
    }
  };

  render() {
    return (
      <div className="ex_container" style={{ textAlign: "center" }}>
        <div className="spirit403"></div>
        <b style={{ display: "block", marginTop: 20 }}>
          {this.props.msg ? this.props.msg : "抱歉,你无权访问该页面"}
        </b>
        <div style={{ marginTop: 15 }}>
          <Button type="primary" onClick={this.goHome}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }
}

export default Page403;
