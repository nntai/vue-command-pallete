import { ref, watch, Ref, onMounted } from "vue";
import Command from "../models/command";
import { getHighlights } from "../methods/highlightText";
import GroupCommand from "../models/groupCommand";
import customerInputController from "./customerInputController";
import lightweightFuzzy from "../methods/lightweightFuzzy";
export default function customerCommandGroupController(
  textInput: Ref<string>,
  isTextCleared: Ref<boolean>,
  commandGroupsInput: {groupName: string, commands: {commandName: string, commandKey: string, commandAction: Function}[]}[]
) {
  const customerGroupsBase: Ref<GroupCommand[]> = ref([]);

  const customerGroupCommands: Ref<GroupCommand[]> = ref([]);

  const customerGroupCommand: Ref<Command> = ref(new Command("", "", () => {}));

  const customerCommandGroupIndex: Ref<{ groupIndex: number; index: number }> =
    ref({ groupIndex: 0, index: 0 });
  // Function to filter the command with Group (tree-select)
  function getCustomerGroupCommands(
    /*
    textInputValue: user input
    commandsInput: group of commands
    */
    textInputValue: string,
    commandsInput: GroupCommand[]
  ) {
    let textInputRemoveSpecialChar = textInputValue.replaceAll(/[^\w\s]/gi, "");
    let groupCommands: GroupCommand[] = [];
    let groupCommandsLeftover: GroupCommand[] = [];
    const regex = new RegExp(textInputRemoveSpecialChar.toLowerCase());
    // loop through every group
    for (let i: number = 0; i < commandsInput.length; ++i) {
      let commandItems: { command: Command; highlightArr: boolean[] }[] = [];
      let commandItemsLeftover: {
        command: Command;
        highlightArr: boolean[];
      }[] = [];
      // loop through every command in each group
      for (let j: number = 0; j < commandsInput[i].getCommands().length; ++j) {
        let commandItem: { command: Command; highlightArr: boolean[] };
        commandItem = commandsInput[i].getCommands()[j];
        // if one command match push in to the list
        if (regex.test(commandItem.command.getCommandName().toLowerCase())) {
          commandItems.push({
            command: commandItem.command,
            highlightArr:
              textInputRemoveSpecialChar.toLowerCase() != ""
                ? getHighlights(
                    commandItem.command.getCommandName().toLowerCase(),
                    textInputRemoveSpecialChar.toLowerCase()
                  )
                : [],
          });
        } else {
          commandItemsLeftover.push({
            command: commandItem.command,
            highlightArr: [],
          });
        }
      }
      // after loop through one group of command if the length of the result list !== 0 then push into the result list
      if (commandItems.length !== 0) {
        let group = new GroupCommand(commandsInput[i].getGroupName(), []);
        group.setCommandsHighlighted(commandItems);
        groupCommands.push(group);
      }
      if (commandItemsLeftover.length !== 0) {
        let group = new GroupCommand(commandsInput[i].getGroupName(), []);
        group.setCommandsHighlighted(commandItemsLeftover);
        groupCommandsLeftover.push(group);
      }
    }
    let fuzzySearchSortedArr: GroupCommand[] = lightweightFuzzy(
      textInputRemoveSpecialChar.toLowerCase(),
      groupCommandsLeftover
    );
    for (
      let fuzzyIndex: number = 0;
      fuzzyIndex < fuzzySearchSortedArr.length;
      fuzzyIndex++
    ) {
      let isExist: number;
      isExist = groupCommands.findIndex((groupCommand: GroupCommand) => {
        return (
          fuzzySearchSortedArr[fuzzyIndex].getGroupName() ===
          groupCommand.getGroupName()
        );
      });
      if (isExist > -1) {
        groupCommands[isExist].setCommandsHighlighted(
          groupCommands[isExist]
            .getCommands()
            .concat(fuzzySearchSortedArr[fuzzyIndex].getCommands())
        );
      } else {
        groupCommands.push(fuzzySearchSortedArr[fuzzyIndex]);
      }
    }
    customerGroupCommands.value = groupCommands;
  }

  function updateCustomerGroupCommand(groupIndex: number, index: number) {
    customerGroupCommand.value =
      customerGroupCommands.value[groupIndex].getCommands()[index].command;
    customerCommandGroupIndex.value = { groupIndex: groupIndex, index: index };
  }

  function previousCustomerGroupCommand() {
    if (customerGroupCommands.value.length !== 0) {
      if (customerCommandGroupIndex.value.index - 1 > -1) {
        updateCustomerGroupCommand(
          customerCommandGroupIndex.value.groupIndex,
          customerCommandGroupIndex.value.index - 1
        );
      } else {
        if (customerCommandGroupIndex.value.groupIndex - 1 > -1) {
          updateCustomerGroupCommand(
            customerCommandGroupIndex.value.groupIndex - 1,
            customerGroupCommands.value[
              customerCommandGroupIndex.value.groupIndex - 1
            ].getCommands().length - 1
          );
        }
      }
    }
  }

  function nextCustomerGroupCommand() {
    if (customerGroupCommands.value.length !== 0) {
      if (
        customerCommandGroupIndex.value.index + 1 <
        customerGroupCommands.value[
          customerCommandGroupIndex.value.groupIndex
        ].getCommands().length
      ) {
        updateCustomerGroupCommand(
          customerCommandGroupIndex.value.groupIndex,
          customerCommandGroupIndex.value.index + 1
        );
      } else {
        if (
          customerCommandGroupIndex.value.groupIndex + 1 <
          customerGroupCommands.value.length
        ) {
          updateCustomerGroupCommand(
            customerCommandGroupIndex.value.groupIndex + 1,
            0
          );
        }
      }
    }
  }

  function commandGroupRefresh() {
    customerGroupCommands.value = [];
    customerGroupCommand.value = new Command("", "", () => {});
    customerCommandGroupIndex.value = { groupIndex: 0, index: 0 };
  }

  function getAllCommands() {
    getCustomerGroupCommands("", customerGroupsBase.value);

    if (customerGroupCommands.value.length != 0) {
      updateCustomerGroupCommand(0, 0);
    }
  }

  watch(textInput, (value) => {
    if (!isTextCleared.value) {
      getCustomerGroupCommands(value, customerGroupsBase.value);
      if (customerGroupCommands.value.length != 0) {
        updateCustomerGroupCommand(0, 0);
      } else {
        commandGroupRefresh();
      }
    }
  });

  onMounted(() => {
    
    let commandGroups: GroupCommand[] = [];
    for (let i: number = 0; i < commandGroupsInput.length; i++) {
      let commandGroup: GroupCommand;
      let commands: Command[] = [];
      for (let j: number = 0; j < commandGroupsInput[i].commands.length; j++) {
        let commandItem: Command;
        commandItem = new Command(commandGroupsInput[i].commands[j].commandName,commandGroupsInput[i].commands[j].commandKey,commandGroupsInput[i].commands[j].commandAction);
        commands.push(commandItem);
      }
      commandGroup = new GroupCommand(commandGroupsInput[i].groupName,commands);
      commandGroups.push(commandGroup);
    }
    customerGroupsBase.value = commandGroups;
  }

  );

  return {
    customerGroupCommands,
    getCustomerGroupCommands,
    customerGroupCommand,
    previousCustomerGroupCommand,
    nextCustomerGroupCommand,
    updateCustomerGroupCommand,
    commandGroupRefresh,
    customerCommandGroupIndex,
    getAllCommands,
    customerGroupsBase
  };
}
