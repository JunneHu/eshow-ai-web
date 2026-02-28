/*
 * @Author: chenhuan
 * @Date: 2025-02-20 16:29:28
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-05-28 19:09:13
 * @Description: 
 */
import { Breadcrumb } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import './index.less';
import { RouteComponentProps } from 'react-router-dom';

interface TopNavProps extends RouteComponentProps {
    navList: {
        link: string;
        name: string;
        isChoose?: boolean;
    }[];
}

const TopNav: React.FC<TopNavProps> = (props) => {
    const { navList, history } = props;
    const toUrl = (item) => {
        if (item.link) {
            props.history.push(item.link);
        }
    }

    return (
        <div className='bread-crumb'>
            <Breadcrumb>
                {navList.map((item) => {
                    return (<Breadcrumb.Item key={item.name} onClick={() => toUrl(item)}>{item.name}</Breadcrumb.Item>)
                })}
            </Breadcrumb>
        </div>
);
}

export default withRouter(TopNav);