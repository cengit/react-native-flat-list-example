import React, { Component, PureComponent } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { NavigatorParams } from 'src/navigation';
import { NavigationScreenProp } from 'react-navigation';

export interface CampaignListItem {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  receiveTime: string;
  rsvpStatus: string;
  campaignStatus: string;
  // weight: number;
}

const mock = (rd: number) => {
  return {
    id: rd,
    name: 'acm name' + rd,
    type: 'road map' + rd,
    startDate: '25/03/2022 12:00',
    endDate: '25/03/2022 13:00',
    receiveTime: '21/02/2022 12:00',
    rsvpStatus: 'pending',
    campaignStatus: rd > 8000 ? 'pending' : 'accepted',
  };
};
const apiPost = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rows: any[] = [];
      for (let index = 0; index < 3; index++) {
        const rd = Math.random() * 10000;
        rows.push(mock(rd));
      }
      const res = {
        rows: rows,
        success: true,
        count: 3,
      };

      resolve(res);
    }, 1000);
  });
};

const LoadingStatus = {
  Show: true,
  Hidden: false,
};

interface Props {
  // data: any[];
  navigation: NavigationScreenProp<NavigatorParams, any>;
}
interface State {
  isRefreshing: boolean; //控制下拉刷新
  isLoadMore: boolean; //控制上拉加载
  page: number; //当前请求的页数
  totalCount: number; //数据总条数
  size: number; //page size
  list: any[];
  loading: boolean;
}
export class Testflatlist extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isRefreshing: false, //控制下拉刷新
      isLoadMore: false, //控制上拉加载
      page: 1, //当前请求的页数
      totalCount: 20, //数据总条数
      size: 3,
      list: [],
      loading: LoadingStatus.Show,
    };
  }

  async getList() {
    console.log('>>getList>>=============');
    const { page, size, totalCount, list } = this.state;

    const data = await apiPost().catch((err) => {
      console.error('error:', err);
    });
    console.log('>>>get listData>>', data);
    if (!data.success) {
      this.setState({
        loading: LoadingStatus.Hidden,
      });
      console.error('error:', data.error);
      console.log('>>>listData>>', data);
    }
    if (page === 1) {
      this.setState({
        list: data.rows,
        totalCount: 20, // set total count
        loading: LoadingStatus.Hidden,
        isRefreshing: false,
      });
    } else {
      this.setState({
        list: [...list, ...data.rows],
        isLoadMore: false,
        loading: LoadingStatus.Hidden,
      });
    }
  }

  _onRefresh = () => {
    console.log('>>下拉刷新>>');
    this.setState(
      {
        isRefreshing: true,
        page: 1,
      },
      () => {
        this.getList();
      }
    );
  };

  onPress = (item: CampaignListItem) => {
    this.props.navigation.navigate('detail-screen', { id: item.id });
  };
  onReject = (item: CampaignListItem) => {
    console.log('on reject===', item);
  };
  onAccept = (item: CampaignListItem) => {
    console.log('on onAccept===', item);
  };

  _renderItem = ({ item }: any) => {
    return (
      <View
        style={{ margin: 10, padding: 10, borderColor: '#ccc', borderWidth: 1 }}
      >
        <Text>{item.name}</Text>
        <Text>
          {item.startDate} - {item.endDate}
        </Text>
      </View>
    );
  };

  _onEndReached = () => {
    console.log('>>上拉加载>>>');
    const { page, size, isLoadMore, totalCount, list } = this.state || {};
    if (list.length < totalCount && !isLoadMore) {
      this.setState(
        {
          page: page + 1,
          isLoadMore: true,
        },
        () => {
          console.log('_onEndReached===========');
          this.getList();
        }
      );
    }
  };

  ListFooterComponent = () => {
    const { totalCount, list } = this.state;
    console.log('footer list:====', list?.length, '&total:', totalCount);
    if (list.length < totalCount) {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" animating={true} />
          <Text style={{ color: 'red' }}> loading more...</Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'red' }}> no more data</Text>
        </View>
      );
    }
  };

  componentDidMount() {
    this.getList();
  }

  render() {
    const { list, isRefreshing, loading } = this.state || {};
    return (
      <FlatList
        keyExtractor={(item) => item.id}
        data={list}
        refreshing={isRefreshing}
        onRefresh={this._onRefresh}
        onEndReachedThreshold={0.1}
        ListFooterComponent={this.ListFooterComponent}
        onEndReached={this._onEndReached}
        renderItem={this._renderItem}
      ></FlatList>
    );
  }
}
