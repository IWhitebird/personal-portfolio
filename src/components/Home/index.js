import { Fragment } from 'react';
import DisplacementSphere from './DisplacementSphere';
import './index.css';

const Home = () => {
  return (
    <div className="home">
      <Fragment>
        <DisplacementSphere />
      </Fragment>
    </div>
  );
};

export default Home;
