import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList } from 'react-native';
import { TextInput, Button, Text, } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Logo = require('./src/assets/logo.png');


const App = () => {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState({});
  const [historico, setHistorico] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  useEffect(() => {
    async function loadHistorico() {
      const historicoString = await AsyncStorage.getItem('@historicoCEP');
      if (historicoString) {
        const historicoArray = JSON.parse(historicoString);
        setHistorico(historicoArray);
      }
    }
    loadHistorico();
  }, []);

  const buscarEndereco = () => {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        setEndereco({
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        });
        salvarHistorico(data);
      });
  };

  const salvarHistorico = async (data) => {
    const historicoArray = [...historico, data];
    setHistorico(historicoArray);
    await AsyncStorage.setItem('@historicoCEP', JSON.stringify(historicoArray));
  };

  const limparHistorico = async () => {
    try {
      await AsyncStorage.removeItem('historico');
      setHistorico([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={Logo} />
      <View style={styles.form}>
        <TextInput
          style={styles.box}
          label="CEP"
          value={cep}
          keyboardType="numeric"
          onChangeText={text => setCep(text)}
          render={props => <TextInputMask{...props} type="zip-code" />}
        />
        <Button style={styles.button} mode="contained" onPress={buscarEndereco}>
          Buscar
        </Button>
      </View>
      <View style={styles.result}>
  {endereco.logradouro && (
    <>
      <Text>{endereco.logradouro}</Text>
      <Text>{endereco.bairro}</Text>
      <Text>{endereco.cidade}, {endereco.estado}</Text>
    </>
  )}
</View>
<View style={styles.result}>
  <Button style={styles.button} mode="contained" onPress={() => setMostrarHistorico(!mostrarHistorico)}>
      Mostrar histórico
  </Button>
  <Button style={styles.button} mode="contained" onPress={limparHistorico}>
            Limpar histórico
          </Button>
  {mostrarHistorico && (
    <FlatList style={styles.tabelas} data={historico} 
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemHistorico}>
          <Text>{item.logradouro}</Text>
          <Text>{item.bairro}</Text>
          <Text>{item.localidade}</Text>
          <Text>{item.uf}</Text>
        </View>
      )}
    />
  )}
</View>

      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  logo: {
    width: 200,
    height: 200,
  },

  box: {
    backgroundColor: '#ace4f2',
    borderColor: '#ace4f2',
  },

  form: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor:'#71afbf',
    borderEndColor: '#71afbf',
  },
  result: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  result2: {
    marginTop: 8,
    marginBottom: 12,
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  itemHistorico: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  historicoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historicoSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  tabelas: {
    marginTop: 10,
  },

});


export default App;
