import React, { useState, useEffect} from 'react';
import NavBar from './components/UI/NavBar/NavBar';
import ButtonLoadMain from './components/UI/Buttons/ButtonLoadMain';
import Loaded from './components/UI/Loaded/Loaded';
import LoadingData from './components/UI/LoadingData/LoadingData';
import api from "../../utils/api"

const Main = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api().get('/api/cards');
        setData(response.data);
        setLoading(false);

      } catch (err) {
        // setError(err);
        console.log("...")
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="MainPage">
      <NavBar />
      <ButtonLoadMain />
      {
        loading ? <LoadingData/> : <Loaded data={data} />
      }
    </div>
  );
}

export default Main;
