import { EventEmitter as EventEmitterO } from 'events';
import * as io from 'socket.io-client';
import { AmongUsState, GameState, Player } from './AmongUsState';
import { SocketElementMap, SocketElement, Client, AudioElement, IDeviceInfo } from './smallInterfaces';
import { element } from 'protractor';
import { async } from '@angular/core/testing';
import { ConnectionController } from './ConnectionController.service';
import { Injectable } from '@angular/core';
import VAD from './vad';

export default class AudioController extends EventEmitterO {
	constructor(private connectionController: ConnectionController) {
		super();
		this.audioElementsCotainer = document.getElementById('AudioElements');
	}
	audioDeviceId = 'default';
	stream: MediaStream;
	audioElementsCotainer: HTMLElement;

	permissionRequested: boolean;
	async startAudio() {
		if (this.stream) {
			return;
		}

		const audio: MediaTrackConstraintSet = {
			deviceId: this.audioDeviceId,
			autoGainControl: false,
			echoCancellation: true,
			latency: 0,
			noiseSuppression: true,
		};
		this.stream = await navigator.mediaDevices.getUserMedia({ video: false, audio });

		console.log('connected to microphone');
	}

	createAudioElement(stream: MediaStream, update: (bool: boolean) => void): AudioElement {
		console.log('[createAudioElement]');
		const htmlAudioElement = document.createElement('audio');
		htmlAudioElement.setAttribute('playsinline', 'true');
		htmlAudioElement.setAttribute('controls', 'true');

		this.audioElementsCotainer.appendChild(htmlAudioElement);
		htmlAudioElement.srcObject = stream;

		const AudioContext = window.webkitAudioContext || window.AudioContext;
		const context = new AudioContext();

		const source = context.createMediaStreamSource(stream);
		const gain = context.createGain();
		const pan = context.createPanner();

		pan.refDistance = 0.1;
		pan.panningModel = 'equalpower';
		pan.distanceModel = 'linear';
		pan.maxDistance = this.connectionController.lobbySettings.maxDistance;
		pan.rolloffFactor = 1;
		gain.gain.value = 0;
		htmlAudioElement.volume = 1;

		const muffle = context.createBiquadFilter();
		muffle.type = 'lowpass';
		muffle.Q.value = 0;
		// const reverb = context.createConvolver();
		// reverb.buffer = convolverBuffer.current;

		source.connect(pan);
		pan.connect(gain);

		const audioContext = pan.context;
		const panPos = [3, 0];

		if (pan.positionZ) {
			pan.positionZ.setValueAtTime(-0.5, audioContext.currentTime);
			pan.positionX.setValueAtTime(panPos[0], audioContext.currentTime);
			pan.positionY.setValueAtTime(panPos[1], audioContext.currentTime);
		} else {
			pan.setPosition(panPos[0], panPos[1], -0.5);
		}
		VAD(context, gain, undefined, {
			onVoiceStart: () => update(true),
			onVoiceStop: () => update(false),
			stereo: false,
		});
		gain.connect(context.destination);

		return {
			htmlAudioElement,
			audioContext: context,
			mediaStreamAudioSource: source,
			gain,
			pan,
			muffle,
			destination: context.destination,
			muffleConnected: false,
		} as AudioElement;
	}

	applyEffect(gain: AudioNode, effectNode: AudioNode, destination: AudioNode, player: Player) {
		try {
			gain.disconnect(destination);
			gain.connect(effectNode);
			effectNode.connect(destination);
		} catch {
			console.log('error with applying effect: ', player.name, effectNode);
		}
	}

	restoreEffect(gain: AudioNode, effectNode: AudioNode, destination: AudioNode, player: Player) {
		try {
			effectNode.disconnect(destination);
			gain.disconnect(effectNode);
			gain.connect(destination);
		} catch {
			console.log('error with applying effect: ', player.name, effectNode);
		}
	}

	// move to different controller
	updateAudioLocation(state: AmongUsState, element: SocketElement, localPLayer: Player): number {
		// console.log('updateAudioLocation ->', { element });
		if (!element.audioElement || !element.client || !element.player || !localPLayer) {
			console.log(element.audioElement, element.client, element.player, localPLayer);
			return 0;
		}
		// console.log('[updateAudioLocation]');
		const pan = element.audioElement.pan;
		const gain = element.audioElement.gain;
		const muffle = element.audioElement.muffle;
		const audioContext = pan.context;
		// const reverb = element.audioElement.reverb;
		const destination = element.audioElement.destination;
		const lobbySettings = this.connectionController.lobbySettings;
		let maxdistance = lobbySettings.maxDistance;

		const other = element.player; // this.getPlayer(element.client?.clientId);
		let panPos = [other.x - localPLayer.x, other.y - localPLayer.y];
		let endGain = 0;
		switch (state.gameState) {
			case GameState.MENU:
				endGain = 0;
				break;

			case GameState.LOBBY:
				endGain = 1;
				break;

			case GameState.TASKS:
				endGain = 1;

				if (lobbySettings.meetingGhostOnly) {
					endGain = 0;
				}
				if (!localPLayer.isDead && lobbySettings.commsSabotage && state.comsSabotaged && !localPLayer.isImpostor) {
					endGain = 0;
				}

				// Mute other players which are in a vent
				if (
					other.inVent &&
					!(lobbySettings.hearImpostorsInVents || (lobbySettings.impostersHearImpostersInvent && localPLayer.inVent))
				) {
					endGain = 0;
				}

				// if (
				// 	lobbySettings.wallsBlockAudio &&
				// 	!me.isDead &&
				// 	poseCollide({ x: me.x, y: me.y }, { x: other.x, y: other.y }, gameState.map)
				// ) {
				// 	endGain = 0;
				// }

				if (!localPLayer.isDead && other.isDead && localPLayer.isImpostor && lobbySettings.haunting) {
					// if (!element.audioElement.reverbConnected) {
					// 	element.audioElement.reverbConnected = true;
					// 	this.applyEffect(gain, reverb, destination, other);
					// }
					endGain = 0.2;
				} else {
					if (other.isDead && !localPLayer.isDead) {
						endGain = 0;
					}
				}

				break;
			case GameState.DISCUSSION:
				panPos = [0, 0];
				endGain = 1;
				// Mute dead players for still living players
				if (!localPLayer.isDead && other.isDead) {
					endGain = 0;
				}
				break;

			case GameState.UNKNOWN:
			default:
				endGain = 0;
				break;
		}

		if (!other.isDead || state.gameState !== GameState.TASKS || !localPLayer.isImpostor || localPLayer.isDead) {
			// if (element.audioElement.reverbConnected && reverb) {
			// 	element.audioElement.reverbConnected = false;
			// 	this.restoreEffect(gain, reverb, destination, other);
			// }
		}

		if (lobbySettings.deadOnly) {
			panPos = [0, 0];
			if (!localPLayer.isDead || !other.isDead) {
				endGain = 0;
			}
		}

		const isOnCamera = false;
		// Muffling in vents
		if (
			((localPLayer.inVent && !localPLayer.isDead) || (other.inVent && !other.isDead)) &&
			state.gameState === GameState.TASKS
		) {
			if (!element.audioElement.muffleConnected) {
				element.audioElement.muffleConnected = true;
				this.applyEffect(gain, muffle, destination, other);
			}
			maxdistance = isOnCamera ? 3 : 0.8;
			muffle.frequency.value = isOnCamera ? 2300 : 2000;
			muffle.Q.value = isOnCamera ? -15 : 20;
			if (endGain === 1) {
				endGain = isOnCamera ? 0.8 : 0.5;
			} // Too loud at 1
		} else {
			if (element.audioElement.muffleConnected) {
				element.audioElement.muffleConnected = false;
				this.restoreEffect(gain, muffle, destination, other);
			}
		}

		// Mute players if distancte between two players is too big
		// console.log({ x: other.x, y: other.y }, Math.sqrt(panPos[0] * panPos[0] + panPos[1] * panPos[1]));
		//console.log(state.currentCamera);
		if (Math.sqrt(panPos[0] * panPos[0] + panPos[1] * panPos[1]) > maxdistance) {
			return 0;
		}

		// if (!settings.enableSpatialAudio) {
		// 	panPos = [0, 0];
		// }

		if (pan.positionZ) {
			pan.positionZ.setValueAtTime(-0.5, audioContext.currentTime);
			pan.positionX.setValueAtTime(panPos[0], audioContext.currentTime);
			pan.positionY.setValueAtTime(panPos[1], audioContext.currentTime);
		} else {
			pan.setPosition(panPos[0], panPos[1], -0.5);
		}
		return endGain;
	}

	disconnect() {
		this.stream.getTracks().forEach((track) => track.stop());
		this.stream = undefined;
	}

	disconnectElement(socketElement: SocketElement) {
		console.log('disconnectElement');

		if (!socketElement.audioElement) {
			console.log('disconnectElement -> !socketElement.audioElement -> ', socketElement);
			return;
		}
		console.log('disconnectElement -> !uff?');
		socketElement?.audioElement?.muffle?.disconnect();
		socketElement?.audioElement?.pan?.disconnect();
		socketElement?.audioElement?.gain?.disconnect();
		socketElement?.audioElement?.mediaStreamAudioSource?.disconnect();
		socketElement?.audioElement?.audioContext
			?.close()
			.then(() => {})
			.catch(() => {});

		console.log('socketElement?.audioElement?.htmlAudioElement');

		if (socketElement?.audioElement?.htmlAudioElement) {
			console.log('remove_element');
			socketElement?.audioElement?.htmlAudioElement.remove();
		}
		socketElement.peer?.destroy();
		socketElement.audioElement = undefined;
		socketElement.peer = undefined;
	}

	async requestPermissions() {
		if (!this.permissionRequested) {
			const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			this.permissionRequested = true;
		}
	}

	async getDevices(): Promise<IDeviceInfo[]> {
		await this.requestPermissions();
		let deviceId = 0;
		return (await navigator.mediaDevices.enumerateDevices())
			.filter((o) => o.kind === 'audiooutput' || o.kind === 'audioinput')
			.sort((a, b) => b.kind.localeCompare(a.kind))
			.map((o) => {
				const id = deviceId++;
				return {
					id,
					kind: o.kind,
					label: o.label || `mic ${o.kind.charAt(5)} ${id}`,
					deviceId: o.deviceId,
				};
			});
	}
}
