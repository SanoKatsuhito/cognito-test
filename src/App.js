/* global IVSPlayer */
//import logo from './logo.svg';
import logo from './k_logo2.svg';
import './App.css';
import ChannelList from './ChannelList'
import Player from './Player'

import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Amplify, Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import { IvsClient, GetStreamKeyCommand, ListStreamKeysCommand, ListChannelsCommand, GetStreamSessionCommand, GetStreamCommand, GetChannelCommand } from '@aws-sdk/client-ivs';
import IVSBroadcastClient, {
  Errors,
  BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';
Amplify.configure(awsmobile) ;

const AWS = require('aws-sdk');
console.log('AWS:', AWS);

function App() {
  const [user, setUser] = useState();
  //const [maxChannel, setMaxChannel] = useState();
  const maxChannelRef = useRef(null);
  const [channelNames, setChannelName] = useState('');
  const [channelLists, setChannels] = useState(null);
  const [ivsClient, setIVS] = useState(null);
  //const [streamInfo, setStreamInfo] = useState(null);
  //const streamInfo = useRef(null);
  const streamInfo = {};
  const videoRef = useRef(null);
/*
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.live-video.net/1.19.0/amazon-ivs-player.min.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
*/
  async function getUserInfo() {
    const UserInfo = await Auth.currentSession();
    setUser(UserInfo.getIdToken().payload);
    console.log('UserInfo:', UserInfo)
    console.log('user:', UserInfo.idToken.payload);
  }

  async function signOut() {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }

  async function getChannels() {
    const UserInfo = await Auth.currentSession();
    setUser(UserInfo.getIdToken.payload);
    console.log('UserInfo:', UserInfo)
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'ap-northeast-1:6e260553-f797-40c6-a12b-a79ee2e72fa5',
      Logins: {
        ['cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_AKGPyO49j']: UserInfo.getAccessToken().getJwtToken()
      }
    })
    console.log('AWS cre:', AWS.config.credentials);
    //console.log('Def config:', AWS.config.getCredentials());
    const provider = new AWS.CognitoIdentityServiceProvider({
      region: 'ap-northeast-1'
    });
    console.log('Token:', UserInfo.getAccessToken());
    const param = {
      AccessToken: UserInfo.getAccessToken().getJwtToken()
    }
    var credentials = await Auth.currentCredentials();
    console.log('Current:', credentials);
    const accessKeyId = credentials.accessKeyId;
    const secretAccessKey = credentials.secretAccessKey;
    const sessionToken = credentials.sessionToken;
    console.log(accessKeyId);
    console.log(secretAccessKey);
    console.log(sessionToken);
    const cre = {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      sessionToken: sessionToken
    };
    const client = new IvsClient({
      credentials: cre,
      region: 'ap-northeast-1'
    });
    console.log('IVS:', client);
    setIVS(client);

    console.log('MaxChannels:', maxChannelRef.current.value);
    var channel_param = {
      //filterByName: 'Kakawari_Test_Channel',
      //filterByRecordingConfigurationArn: '',
      nextToken: '',
      maxResults: Number(maxChannelRef.current.value)
    }
    const channnel_command = new ListChannelsCommand(channel_param);
    
    var tmpChannels = [];
    do {
      var channels = await client.send(channnel_command);
      console.log('CHA:', channels);
      channels.channels.forEach(channelLists => {
        console.log('Channel:', channelLists);
        tmpChannels.push(channelLists);
      })
      channel_param.nextToken = channels.nextToken;
    } while( channels.nextToken !== undefined);
    setChannels(tmpChannels);
  }

  async function getStreamKey() {
    console.log('IVS(in getStream):', ivsClient);
    console.log('List:', channelLists);
    console.log('Name:', channelNames);
    const params = {
      channelArn: channelLists.find((item) => item.name === channelNames).arn,
      nextToken: '',
      maxResults: 1,
    };
    var s_param = {
      channelArn: channelLists.find((item) => item.name === channelNames).arn
    }
    var c_param = {
      arn: channelLists.find((item) => item.name === channelNames).arn
    }
    var k_param = {
      arn: channelLists.find((item) => item.name === channelNames).arn
    }
    const command = new ListStreamKeysCommand(params);
    const data = await ivsClient.send(command);
    console.log('DD:', data);
    data.streamKeys.forEach(streamKey => {
      //console.log(`ストリームキー: ${streamKey.value}`);
      //console.log(`有効期限: ${streamKey.expiresAt}`);
      console.log(`Arn: ${streamKey.arn}`);
      console.log(`ChannelArn: ${streamKey.channelArn}`);
    });
    k_param.arn = data.streamKeys[0].arn;
    var sk = await ivsClient.send(new GetStreamKeyCommand(k_param));
    console.log('SK:', sk);

    var cc = await ivsClient.send(new GetChannelCommand(c_param));
    console.log('Channel:', cc);

    //var ss = await ivsClient.send(new GetStreamSessionCommand(s_param));
    //console.log('SS:', ss);
    var s_info = {};
    s_info['streamKey'] = sk.streamKey.value;
    s_info['streamUrl'] = cc.channel.ingestEndpoint;
    s_info['playbackUrl'] = cc.channel.playbackUrl;
    console.log('set StreamInfo', s_info);
    //setStreamInfo(s_info);
  }

  const playVideo = () => {
    console.log('StreamInfo:', streamInfo);
    if (IVSPlayer.isPlayerSupported) {
      const player = IVSPlayer.create();
      player.attachHTMLVideoElement(videoRef.current);
      console.log('URL:', streamInfo.playbackUrl);
      player.load(streamInfo.playbackUrl);
      player.play();
    }
  }
  async function handleSelectChange(event) {
    setChannelName(event.target.value);
  }
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <p>ようこそKakawari Live配信サイト5</p>
      <Authenticator>
{/*
        <Link to={'/'}>List</Link>
        <Link to={'/Player/'}>Player</Link>
  */}
        <header className="App-header">
          <Router>
            <Routes>
              <Route path={'/'} element={<ChannelList AWS={AWS} streamInfo={streamInfo} />} />
              <Route path={'/Player/'} element={<Player AWS={AWS} streamInfo={streamInfo}/>} />
            </Routes>
            <div>UserName:{user ? user.user : "No Data"}</div>
            <div>e-mail:{user ? user.email : "e-mail"}</div>
            <div>Cognito UserName: {user ? user['cognito:username'] : "No Data"}</div>
            <div>Group:{user ? user['cognito:groups'] : "No Data"}</div>
            <div><button id='button' onClick={() => getUserInfo()}>Show User Info</button></div>
            {/*
            <div><input ref={maxChannelRef} type='text' defaultValue='5'
            //onChange={(ev) => setMaxChannel(ev.target.value)}
            ></input></div>
            <div><button id='button' onClick={() => getChannels()}>チャンネル取得</button></div>
            <div>
              <select value={channelNames} onChange={handleSelectChange}>
                <option value="">チャンネルを選んでください</option>
                {channelLists && channelLists.map((channel, index) => (
                  <option key={index} value={channel['name']}>{channel['name']}</option>
                ))}
              </select>
              {channelNames && (
                <div>
                  <p>チャンネル名：{channelLists.find((item) => item.name === channelNames).name}</p>
                  <p>arn：{channelLists.find((item) => item.name === channelNames).arn}</p>
                  <p>レイテンシー：{channelLists.find((item) => item.name === channelNames).latencyMode}</p>
                </div>
              )}

            </div>
            <div><button id='button' onClick={getStreamKey}>getStream</button></div>
            <div>
              {streamInfo && (
                <div>
                  <p>ストリームキー：{streamInfo.streamKey}</p>
                  <p>カスタムURL：rtmps://{streamInfo.streamUrl}:443/app/</p>
                  <p>再生URL：{streamInfo.playbackUrl}</p>
                </div>
              )}
            </div>
            */}
            <div>
              <video ref={videoRef} id='video-player' playsInline></video>
              <button onClick={playVideo}>Play Video</button>
              <div><Link to='/'>Channel List</Link></div>
              <div><Link to='/Player/'>Player</Link></div>
            </div>
            <div><button id='button' onClick={() => console.log('IVS:', ivsClient)}>IVS</button></div>
            <div><button id='button' onClick={signOut}>Sign Out</button></div>
          </Router>
        </header>
      </Authenticator>
    </div>
  );
}

export default App;
