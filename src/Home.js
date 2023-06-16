import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { IvsClient, GetStreamKeyCommand, ListStreamKeysCommand, ListChannelsCommand, GetStreamSessionCommand, GetStreamCommand, GetChannelCommand } from '@aws-sdk/client-ivs';

const Home = () => {
    return (
        <>
            <h1>ホーム</h1>
        </>
    )
}
export default Home;