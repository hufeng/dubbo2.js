/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { util } from 'apache-dubbo-common'
import {
  IDubboServiceSetting,
  TDubboServiceInterface,
  TDubboServiceShortName,
  TMatchThunk
} from './types'

export class DubboSetting {
  private readonly matchDubboInterface: Map<
    TDubboServiceInterface,
    IDubboServiceSetting
  >
  private readonly matchDubboRegx: Map<RegExp, IDubboServiceSetting>
  private readonly matchDubboThunk: Set<TMatchThunk>

  constructor() {
    this.matchDubboInterface = new Map()
    this.matchDubboRegx = new Map()
    this.matchDubboThunk = new Set()
  }

  match(
    rule: TDubboServiceInterface | Array<TDubboServiceInterface> | RegExp,
    meta: IDubboServiceSetting
  ) {
    if (util.isString(rule)) {
      this.matchDubboInterface.set(rule, meta)
    } else if (util.isArray(rule)) {
      rule.forEach((r) => this.matchDubboInterface.set(r, meta))
    } else if (rule instanceof RegExp) {
      this.matchDubboRegx.set(rule, meta)
    }
    return this
  }

  matchThunk(thunk: TMatchThunk) {
    this.matchDubboThunk.add(thunk)
    return this
  }

  getDubboSetting({
    dubboServiceShortName,
    dubboServiceInterface
  }: {
    dubboServiceShortName?: TDubboServiceShortName
    dubboServiceInterface?: TDubboServiceInterface
  }) {
    // first, we search thunk
    for (let thunk of this.matchDubboThunk) {
      const meta = thunk(dubboServiceShortName)
      if (meta) {
        return meta
      }
    }

    // second, search from dubboInterface
    if (this.matchDubboInterface.has(dubboServiceInterface)) {
      return this.matchDubboInterface.get(dubboServiceInterface)
    }

    // third, search from regx
    for (let [r, meta] of this.matchDubboRegx) {
      if (r.test(dubboServiceInterface)) {
        return meta
      }
    }

    // no match anything
    return null
  }
}

export const dubboSetting = new DubboSetting()
