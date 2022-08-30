# Vue-Command-Palette

[Demo](Link.com)

> Command Palette Component For Vue3
## Demo

## Installization

```bash
 $ npm install command-palette-vue3 --save
```

## Usage

```html
<script>
  import CommandPalette from 'command-palette-vue3';
  import "command-palette-vue3/dist/style.css";
  // Optional can disable display by group by adding return false to the isDisplayByGroup
  const isDisplayByGroup = computed(() => {
  return true;
  });
  // Optional delete if donot want to using default light and dark theme
  const themeMode = ref({
    dark: true,
    light: false
  });
  /*
  Optional delete if donot want to using changeTheme function can assign theme directly
  by adding class="light" or class="dark" to <CommandPalette>
  */
  const changeTheme=()=>{
    themeMode.value.dark=!themeMode.value.dark;
    themeMode.value.light=!themeMode.value.light;
  };
  const customerGroups = computed(() => {
  return [
    {groupName:"Default",
    commands:[
      {commandName:"Switch Light/Dark Theme", 
      commandKey:"Control+m", 
      commandAction:() => {changeTheme();}},
      {commandName:"Test Command", 
      commandKey:"Control+Shift+m", 
      commandAction:() => {alert("Test Command excecute.")}},
      ]},
  ];
});
</script>
<template>
<CommandPalette :themeMode="themeMode" :customerGroups="customerGroups" :isDisplayByGroup="isDisplayByGroup"/>
</template>
```
### Props

| Prop                    | Description                                      | Type                                             | Default                 |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------|
| themeMode               | select the theme of the command palette          | `object`                                         |{dark:true, light: false}|
| modalKey                | command palette open modal keys                  | `string`                                         | "Control+k"             |
| customerCommandByGroup  | array included all command by group              | `array`                                          | [Object]                |
| isDisplayByGroup        | option to display by group or not                | `boolean`                                        | false                   |

### Object
```object
return [
    {groupName:"Default",
    commands:[
      {commandName:"Switch Light/Dark Theme", 
      commandKey:"Control+m", 
      commandAction:() => {changeTheme();}},
      {commandName:"Test Command", 
      commandKey:"Control+Shift+m", 
      commandAction:() => {alert("Test Command excecute.")}},
      ]},
  ];
});
```


### Events

| Name            | Description                                                                            | Callback Arguments                                     |
| --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| default         | When the value change(v-model:value event)                                             | default                                                |

### Slots
| Name          | Description                  |
| ------------- | -----------------------------|
| cmd-item      | custom the item in the result|

## ChangeLog

[CHANGELOG](CHANGELOG.md)

## License

Copyright (c) 2022-present test