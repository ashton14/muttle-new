import core from 'express-serve-static-core';
import express from 'express';
import { Token } from '../utils/auth';

// TODO - specify app/route specific typings
export type RequestBody = any;
export type ResponseBody = any;
export type Query = core.Query;
export type Params = core.ParamsDictionary;

export interface Request<
  ReqBody = RequestBody,
  ReqQuery = Query,
  URLParams extends Params = core.ParamsDictionary
> extends express.Request<URLParams, ResponseBody, ReqBody, ReqQuery> {
  user: Token;
}
