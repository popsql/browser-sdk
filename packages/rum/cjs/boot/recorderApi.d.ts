import type { RecorderApi } from '@datadog/browser-rum-core';
import { startDeflateWorker } from '../domain/segmentCollection';
import type { startRecording } from './startRecording';
export declare type StartRecording = typeof startRecording;
export declare function makeRecorderApi(startRecordingImpl: StartRecording, startDeflateWorkerImpl?: typeof startDeflateWorker): RecorderApi;