import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    refreshing: false,
    loadingMore: false,
  };

  async componentDidMount() {
    this.getStars();
  }

  getStars = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page === 1 ? response.data : [...stars, ...response.data],
      loading: false,
      page,
      refreshing: false,
      loadingMore: false,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    this.getStars(page + 1);

    this.setState({ loadingMore: true });
  };

  refreshList = () => {
    this.setState({
      refreshing: true,
      stars: [],
    });

    this.getStars(1);
  };

  handleNavigate = url => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { url });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing, loadingMore } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#000" size={36} marginTop={40} />
        ) : (
          <Stars
            onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
            refreshing={refreshing} // Variável que armazena um estado true/false que representa se a lista está atualizando
            // Restante das props
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
            onEndReached={this.loadMore} // Função que carrega mais itens
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item.html_url)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
        {loadingMore && <ActivityIndicator color="#000" marginTop={10} />}
      </Container>
    );
  }
}
