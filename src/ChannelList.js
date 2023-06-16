import { Link } from 'react-router-dom';
import { IvsClient, GetStreamKeyCommand, ListStreamKeysCommand, ListChannelsCommand, GetStreamSessionCommand, GetStreamCommand, GetChannelCommand } from '@aws-sdk/client-ivs';
import React, { useState, useRef, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';

const ChannelList = (props) => {
    const maxChannelRef = useRef(null);
    const [channelNames, setChannelName] = useState('');
    const [channelLists, setChannels] = useState(null);
    const [ivsClient, setIVS] = useState(null);
    const [sInfo, setSInfo] = useState({});
    //const streamInfo = useRef(null);
    const videoRef = useRef(null);

    const { AWS } = props;
    const { streamInfo } = props;
    console.log('###StreamInfo:', streamInfo);
    //sInfo['streamKey'] = '';
    //sInfo['streamUrl'] = '';
    //sInfo['playbackUrl'] = '';
    //sInfo = {};

    async function getChannels() {
        const UserInfo = await Auth.currentSession();
        //setUser(UserInfo.getIdToken.payload);
        //console.log('UserInfo:', UserInfo)
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
        } while (channels.nextToken !== undefined);
        setChannels(tmpChannels);
    }

    async function handleSelectChange(event) {
        setChannelName(event.target.value);
        console.log('Val:', event.target.value);
        console.log('List:', channelLists);
        console.log('Name:', channelNames);
        console.log('Selected:', channelLists.find((item) => item.name === event.target.value));
        const params = {
            channelArn: channelLists.find((item) => item.name === event.target.value).arn,
            nextToken: '',
            maxResults: 1,
        };
        var s_param = {
            channelArn: channelLists.find((item) => item.name === event.target.value).arn
        }
        var c_param = {
            arn: channelLists.find((item) => item.name === event.target.value).arn
        }
        var k_param = {
            arn: channelLists.find((item) => item.name === event.target.value).arn
        }
        const command = new ListStreamKeysCommand(params);
        const data = await ivsClient.send(command);
        console.log('DD:', data);
        data.streamKeys.forEach(streamKey => {
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
        //var s_info = {};
        //s_info['streamKey'] = sk.streamKey.value;
        //s_info['streamUrl'] = cc.channel.ingestEndpoint;
        //s_info['playbackUrl'] = cc.channel.playbackUrl;
        streamInfo['streamKey'] = sk.streamKey.value;
        streamInfo['streamUrl'] = cc.channel.ingestEndpoint;
        streamInfo['playbackUrl'] = cc.channel.playbackUrl;
        console.log('set StreamInfo:', streamInfo);
        setSInfo(streamInfo);
        //streamInfo = s_info;
    }

    return (
        <>
            <h1>チャンネル一覧0</h1>
            <div><input ref={maxChannelRef} type='text' defaultValue='5'></input></div>
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
                {streamInfo && (
                    <div>
                        <p>ストリームキー：{sInfo.streamKey}</p>
                        <p>カスタムURL：rtmps://{sInfo.streamUrl}:443/app/</p>
                        <p>再生URL：{sInfo.playbackUrl}</p>
                    </div>
                )}
            </div>
        </>
    )
}
export default ChannelList;