/* global IVSPlayer */
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {uuidv4} from './helpers';
import axios from 'axios';
import {Ivschat} from '@aws-sdk/client-ivschat';
import {Auth} from 'aws-amplify';

const Player = (props) => {
    const {videoRef, streamInfo} = props;
    const { AWS } = props;
    console.log('sinfo.url:', streamInfo.playbackUrl);
/*
    useEffect(() => {
        console.log('Use Effect');
        const script = document.createElement('script');
        script.src = 'https://player.live-video.net/1.19.0/amazon-ivs-player.min.js';
        script.async = true;

        document.body.appendChild(script);
        console.log('StreamInfo:', streamInfo);
        if (IVSPlayer.isPlayerSupported) {
            const player = IVSPlayer.create();
            //player.attachHTMLVideoElement(videoRef.current);
            player.attachHTMLVideoElement(document.getElementById('video-player'));
            console.log('URL:', streamInfo.playbackUrl);
            player.load(streamInfo.playbackUrl);
            player.play();
        }
        return () => {
            //document.body.removeChild(script);
        };
    }, []);
*/
    const senderText = useRef(null);
    const senderMessage = useRef(null);
    const viewerText = useRef(null);
    const viewerMessage = useRef(null);
    const senderToken = 'AQICAHhVX2Fx3cUROsXUYcIVJfH7erANLjzstQ9nJIPeMGkGUgFcZk_v2muqjtLpynaq50i3AAAB3DCCAdgGCSqGSIb3DQEHBqCCAckwggHFAgEAMIIBvgYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAylahJT8NYS5JMBDQ8CARCAggGPQI9Rp6a2gtUODVHSXBOefdfFB0hR8_WuLphyvqA4-5HY6PvqUzDcjcDAUD0mAikVVuAQMREt2u8t7sJ4OhUwQ5hoZdLFWW8CDRkrj2zMhh-U4rIfouI8ZfgiB4EmPMIXtxo2kJmvK36mmlsu46lH6FKOMXIYqbDaznGmxCZQa2vXrwKSO499_-xSd5ztbcOSBUR-bACmpuBV9JlZ8FEu1tV22luAbDZ9kKxSG-Ia1vISBVNfH3jbJ5RKhy_U_EzsvTzNJikkS_mGQtaWb24-K-ZB_db9KX4_z9_SHucGX1si-DNreQoW3E-_sx-HHM7REbohU_d9YoZedc84K1nxb8nTTIBNNOOivJSGrSSZURAjc8DuAe5O22uvNI8fYRvSI4g3Fi--lQCZSKLaAT6yoZNvQlL2WY6rOanB484v-JQCHfmsiA0ME-ua6jxycHWUW_1FGd1de4NsH-rwonT49pdcVIx8E4vMxr1KHVK0E33XeDOAfIwb2XyQ9aYUOD_Lgjc5Po8X-_Teoc592BXj#0';
    const viewerToken = 'AQICAHhVX2Fx3cUROsXUYcIVJfH7erANLjzstQ9nJIPeMGkGUgFM902msYi14Z0PoOVC5XhbAAACKDCCAiQGCSqGSIb3DQEHBqCCAhUwggIRAgEAMIICCgYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAyS9BnGa8dgg-81fAACARCAggHbYtElAIxJCpDZE65d_jjIOcoIjOodk5RAqejtm0-t2VfVtPjRfZQ7-fKTf-yW9xxC4NacBHMzcM67a8X0LOkxk3ANIxBcPr8Yl3VM2PVtzVbp1LfWoG1fb7M4wwSbtTCDjKq25iwy2fDsARAIpRXRRz0kLV-xC9Bb5JEWoikceImWonWgwjYme80b_MFqKI-LOuuFyBhr_fh5aeYtLtqOenytCtYsM5cjuMoBxOKW8but-SV6MCDPlvAUCAjh9CvhIZISAKid9N_sITOdYp1PhsmDsdrUX8P8_d5j3JedG76VWLM332Kp8e71EKNRTDps0vEhLWEed5Y9cnrFw_xC47qR6r5iNROvxkIQidoI93H5j_jR7WtqBIK6ABHWZHTQcS6unOSZSvTbQ9aFkvuNWqGgViJoN3UuKfClnCsuhCpAABAECtjpBLMBGZQx7079JgD_uqb5nsgSerfCEtHcltJcLz5OS_dLAFce0xOM5AcZESm-pAPVswIK5bbo50BCYOvh_YONtTpywpOGE_53n9cS11-4_C8MGZFUUd3D7HiDVsGy5mWadP-cQSuA097Eq_xOlgfxxdi1IdlOC2eBOVIQ8yoPCU-HsRFC6D1A5ElOB3QSVFzrSxIuew!!#1';
    const chatSocket = 'wss://edge.ivschat.ap-northeast-1.amazonaws.com';
    //const senderConn = new WebSocket(chatSocket, senderToken);
    //const viewerConn = new WebSocket(chatSocket, viewerToken);
    var senderConn = null;
    var viewerConn = null;
    const roomArn = 'arn:aws:ivschat:ap-northeast-1:533666699657:room/Ke1J8cK0K72Y';
    const apiurl = 'ivschat.ap-northeast-1.amazonaws.com';

    // Fetches a chat token
    async function tokenProvider(selectedUsername, isModerator) {
        console.log('Provider');
        return new Promise((resolve, reject) => {
            //var credentials = await Auth.currentCredentials();
            console.log('current Credentials');
            Auth.currentCredentials().then((credentials) => {
                console.log('Credentials:', credentials);
                var ivschat = new Ivschat({ region: 'ap-northeast-1', credentials });
                console.log('IvsChat:', ivschat);
                console.log('End Point:', ivschat.Endpoint);
                const uuid = uuidv4();
                const permissions = isModerator
                    ? ['SEND_MESSAGE', 'DELETE_MESSAGE', 'DISCONNECT_USER']
                    : ['SEND_MESSAGE'];

                const data = {
                    roomIdentifier: roomArn,
                    arc: roomArn,
                    userId: `Sender.${uuid}`,
                    attributes: {
                        username: `${selectedUsername}`,
                    },
                    capabilities: permissions,
                };

                console.log('Token Param:', data);
                var token;
                console.log('CreateChatToken');
                ivschat.createChatToken(data, (err, chatData) => {
                    console.log('Callback');
                    if (err) {
                        console.log(err, err.stack);
                        reject(err);
                    } else {
                        console.log('Data:', chatData);
                        const token = chatData.token;
                        console.log('++Token:', token);
                        resolve(token);
                    }
                });
            })

            /*
            Auth.currentCredentials((err, credentials) => {
                console.log('Err:', err);
                console.log('Cre:', credentials);
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }

                console.log('Credentials:', credentials);
                var ivschat = new Ivschat({ region: 'ap-northeast-1', credentials });
                console.log('IvsChat:', ivschat);
                console.log('End Point:', ivschat.Endpoint);

                const uuid = uuidv4();
                const permissions = isModerator
                    ? ['SEND_MESSAGE', 'DELETE_MESSAGE', 'DISCONNECT_USER']
                    : ['SEND_MESSAGE'];

                const data = {
                    roomIdentifier: roomArn,
                    arc: roomArn,
                    userId: `Sender.${uuid}`,
                    attributes: {
                        username: `${selectedUsername}`,
                    },
                    capabilities: permissions,
                };

                console.log('Token Param:', data);
                var token;
                console.log('CreateChatToken');
                ivschat.createChatToken(data, (err, chatData) => {
                    console.log('Callback');
                    if (err) {
                        console.log(err, err.stack);
                        reject(err);
                    } else {
                        console.log('Data:', chatData);
                        const token = chatData.token;
                        console.log('++Token:', token);
                        resolve(token);
                    }
                });
            });
            */
        });
    };

    async function sendMessageSender() {
        console.log('Send Message(Sender):', senderMessage.current.value);
        console.log('Sender Conn:', senderConn);
        const payload = {
            'Action': 'SEND_MESSAGE',
            'Content': senderMessage.current.value,
            'Attributes': {
                'CustomMetadata': 'sender'
            }
        }
        if (senderConn === null) {
            var senderToken = await tokenProvider('Sender', true);
            console.log('Sender Token:', senderToken);
            senderConn = new WebSocket(chatSocket, senderToken);
        }
        //senderConn.onopen = () => senderConn.send(JSON.stringify(payload));
        senderConn.send(JSON.stringify(payload));
        senderConn.onmessage = (event) => {
            const data = JSON.parse(event.data);
            displayMessageSender({
                display_name: data.Sender.Attributes.DisplayName,
                message: data.Content,
                timestamp: data.SendTime
            });
        }
        console.log('Send Finish');
    }

    async function sendMessageViewer() {
        console.log('Send Message(Viewer):', viewerMessage.current.value);
        const payload = {
            'Action': 'SEND_MESSAGE',
            'Content': viewerMessage.current.value,
            'Attributes': {
                'CustomMetadata': 'viewer'
            }
        }
        if (viewerConn === null) {
            var viewerToken = await tokenProvider('Viewer', false);
            viewerConn = new WebSocket(chatSocket, viewerToken);
        }
        //viewerConn.onopen = () => viewerConn.send(JSON.stringify(payload));
        viewerConn.send(JSON.stringify(payload));
        viewerConn.onmessage = (event) => {
            const data = JSON.parse(event.data);
            displayMessageViewer({
                display_name: data.Sender.Attributes.DisplayName,
                message: data.Content,
                timestamp: data.SendTime
            });
        }
        console.log('Send Finish');
    }

    async function viewMessageSender() {
        if (senderConn === null) {
            senderConn = new WebSocket(chatSocket, senderToken);
        }
        senderConn.onmessage = (event) => {
            const data = JSON.parse(event.data);
            displayMessageSender({
                display_name: data.Sender.Attributes.DisplayName,
                message: data.Content,
                timestamp: data.SendTime
            });
        }
    }

    async function viewMessageViewer() {
        if (viewerConn === null) {
            viewerConn = new WebSocket(chatSocket, viewerToken);
        }
        viewerConn.onmessage = (event) => {
            const data = JSON.parse(event.data);
            displayMessageViewer({
                display_name: data.Sender.Attributes.DisplayName,
                message: data.Content,
                timestamp: data.SendTime
            });
        }
    }

    async function displayMessageSender(message) {
        console.log('Sender Chat:', message);
        const textarea = senderText.current;
        console.log('TextArea Current:', textarea);
        const val = await textarea.value;
        console.log('Textarea Value:', val);
        const newval = val + '\n' + message.message;
        textarea.value = newval;
        textarea.scrollTop = textarea.scrollHeight;
    }

    async function displayMessageViewer(message) {
        console.log('Viewer Chat:', message);
        const textarea = await viewerText.current;
        const val = await textarea.value;
        const newval = val + '\n' + message.message;
        textarea.value = newval;
        textarea.scrollTop = textarea.scrollHeight;
    }

    return (
        <>
            <h1>ホーム</h1>
            <div>
                <h2>ライブ配信画面</h2>
                {/*<video ref={videoRef} id='video-player' playsInline></video>*/}
                <ReactPlayer url={streamInfo.playbackUrl} playing />
            </div>
            <div>
                <h2>チャット画面(配信者)</h2>
                <textarea ref={senderText} rows={5}/>
                <div>
                    <input type='text' ref={senderMessage} defaultValue={'テスト'}></input>
                    <button onClick={() => sendMessageSender()}>送信</button>
                    <button onClick={() => viewMessageSender()}>表示</button>
                </div>
            </div>
            <div>
                <h2>チャット画面(視聴者)</h2>
                <textarea ref={viewerText} rows={5} />
                <div>
                    <input type='text' ref={viewerMessage} defaultValue={'てすと'}></input>
                    <button onClick={() => sendMessageViewer()}>送信</button>
                    <button onClick={() => viewMessageViewer()}>表示</button>
                </div>
            </div>
        </>
    )
}
export default Player;