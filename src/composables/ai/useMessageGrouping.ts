/**
 * 消息分组 Composable
 *
 * 将聊天消息列表转换为分组显示结构，主要功能：
 * 1. 合并工具调用流程：将 assistant 消息的 tool_calls 和后续的 tool 消息合并为一个卡片
 * 2. 保持普通消息不变：user 和不带 tool_calls 的 assistant 消息独立显示
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import type { ToolCall } from '@/types/api';
import type { DisplayMessage } from './useAiEventListeners';

/**
 * 分组消息类型
 *
 * 使用类型判别联合 (Discriminated Union) 区分不同类型的消息组：
 * - normal: 普通的用户或助手消息
 * - tool-execution: 工具调用流程组（包含调用请求和执行结果）
 */
export type GroupedMessage =
  | { type: 'normal'; message: DisplayMessage }
  | { type: 'tool-execution'; toolCalls: ToolCall[]; toolResults: DisplayMessage[]; timestamp: Date };

/**
 * 使用消息分组
 *
 * 将原始消息列表转换为分组显示结构
 *
 * 处理逻辑示例：
 * ```
 * 原始消息序列：
 * [
 *   { role: 'user', content: '搜索XXX' },
 *   { role: 'assistant', content: '', tool_calls: [{id: 'call_1', ...}] },
 *   { role: 'tool', content: '{...}', tool_call_id: 'call_1' },
 *   { role: 'assistant', content: '根据搜索结果...' }
 * ]
 *
 * 分组后：
 * [
 *   { type: 'normal', message: {...} },                    // user 消息
 *   { type: 'tool-execution', toolCalls: [...], toolResults: [...] }, // 工具调用组
 *   { type: 'normal', message: {...} }                     // assistant 回复
 * ]
 * ```
 *
 * @param messages - 原始消息列表响应式引用
 * @returns 分组后的消息列表计算属性
 */
export function useMessageGrouping(messages: Ref<DisplayMessage[]>): ComputedRef<GroupedMessage[]> {
  return computed<GroupedMessage[]>(() => {
    const result: GroupedMessage[] = [];
    let i = 0;

    while (i < messages.value.length) {
      const msg = messages.value[i];

      // 检测工具调用起始点：带 tool_calls 的 assistant 消息
      if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
        const toolCalls = msg.tool_calls;
        const toolResults: DisplayMessage[] = [];
        let j = i + 1;

        // 收集紧随其后的所有 tool 消息（工具执行结果）
        while (j < messages.value.length && messages.value[j].role === 'tool') {
          toolResults.push(messages.value[j]);
          j++;
        }

        // 添加工具执行组（单个卡片显示）
        result.push({
          type: 'tool-execution',
          toolCalls,
          toolResults,
          timestamp: msg.timestamp
        });

        i = j; // 跳过已处理的 tool 消息
      } else if (msg.role !== 'tool') {
        // 普通消息（user 或不带 tool_calls 的 assistant）
        result.push({
          type: 'normal',
          message: msg
        });
        i++;
      } else {
        // 孤立的 tool 消息（没有对应的 tool_calls）
        // 理论上不应该发生，跳过以保证健壮性
        i++;
      }
    }

    return result;
  });
}
