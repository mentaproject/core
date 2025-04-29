
import type { AbiToContractEventsHandlers, GetContractParameters, CoreClient, AbiError, AbiEvent, AbiItem, Address, Hex, Log } from "../types";
import type { FilterAbiByType, DecodeErrorResultReturnType } from "../types/Abi";

import { watchContractEvent } from "../actions";
import { decodeErrorResult as viemDecodeErrorResult } from "../utils";


export class Contract<P extends GetContractParameters<ReadonlyArray<AbiItem>>> {
   readonly address: Address;
   protected readonly rpcClient: CoreClient;
   protected readonly abi: P['abi'];
   protected readonly errorAbis: FilterAbiByType<P['abi'], 'error'>;

   constructor(rpcClient: CoreClient, params: P) {
       if (!params.address) { throw new Error("Contract Error: Address is required."); }
       if (!params.abi) { throw new Error("Contract Error: ABI is required."); }

       this.rpcClient = rpcClient;
       this.address = params.address;
       this.abi = params.abi;

       this.errorAbis = this.abi.filter(
           (item): item is AbiError => item.type === 'error'
       ) as FilterAbiByType<P['abi'], 'error'>;
   }

   on<TEventName extends string & keyof AbiToContractEventsHandlers<P['abi']>>(
       eventName: TEventName,
       callback: AbiToContractEventsHandlers<P['abi']>[TEventName]
   ): () => void {
       const eventAbi = this.abi.find(
            (item): item is AbiEvent => item.type === 'event' && item.name === eventName
       );
       if (!eventAbi) {
           const errorMsg = `[Contract.on] Event ABI definition for "${String(eventName)}" not found. Cannot subscribe.`;
           throw new Error(errorMsg);
       }
       const specificEventAbi = [eventAbi] as const;

       return watchContractEvent(this.rpcClient, {
           address: this.address,
           abi: specificEventAbi,
           eventName: eventName,
           strict: true,
           onLogs: (logs: Log[]) => {
                logs.forEach(log => callback(log as any));
           },
       });
   }

   public decodeErrorResult(data: Hex): DecodeErrorResultReturnType<P['abi']> {
       try {
           const decoded = viemDecodeErrorResult({
               abi: this.errorAbis,
               data: data
           });

            return {
                errorName: decoded.errorName,
                args: decoded.args as any
            } as DecodeErrorResultReturnType<P['abi']>;

       } catch (e) {
           return null;
       }
   }
}