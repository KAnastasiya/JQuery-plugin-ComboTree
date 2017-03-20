## JQuery Plugin 'ComboTree'

Плагин позволяет сделать из любого div-элемента категоризированный выпадающий список с поддержкой поиска.
Демо доступно по адресу [JQuery Plugin 'ComboTree'](http://kanastasiya.github.io/JQuery-plugin-ComboTree).

#### Подключение плагина
1. Подключить стили плагина, т.е. добавить в секции head строку `<link href="jquery.combotree.min.css" rel="stylesheet">`
2. *Подключить библиотеку jQuery, т.е. добавить строку `<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>`
3. Подключить непосредственно плагин, т.е. добавить перед закрывающимся тегом </body> строку `<script src="jquery.combotree.min.js"></script>`

*Подключение jQuery должно быть выполнено перед подключением плагина. Это можно сделать либо в секции head, либо перед закрывающимся тегом </body>. Второй вариант более предпочтителен*

#### Использование плагина
1. Добавить в разметку страницы (html-файл) div-элемент с любым классом или идентификатором.
2. Для div-элемента из пункта 1 вызвать плагин, передав в него необходимые данные и настройки, то есть перед закрывающимся тегом </body> (после подключения плагина) добавить строки:
```
<script>
  $('<СЕЛЕКТОР ЭЛЕМЕНТА, ДЛЯ КОТОРОГО ВЫЗЫВАЕТСЯ ПЛАГИН>').combotree({
    'element': '<НАЗВАНИЕ КЛАССА ЭЛЕМЕНТА, ДЛЯ КОТОРОГО ВЫЗЫВАЕТСЯ ПЛАГИН>',
    'label': '<НАЗВАНИЕ ПОЛЯ>',
    'value': '<ЗНАЧЕНИЕ ПОЛЯ ПО УМОЛЧАНИЮ>',
    'placeholder': '<ПРИГЛАШЕНИЕ КО ВВОДУ>',
    'data': {<ДАННЫЕ ДЛЯ ПОЛЯ В JSON-ФОРМАТЕ>}
  });
</script>
```

Структура данных для поля следующая:
```
{
  'id': '<ВСЕГДА '' (пусто)>',
  'name': '<ВСЕГДА root>',
  'children': [{
      'id': '<ИДЕНТИФИКАТОР ЗАПИСИ>',
      'name': '<НАЗВАНИЕ ЗАПИСИ>',
      'children': [{
          'id': '<ИДЕНТИФИКАТОР ЗАПИСИ>',
          'name': '<НАЗВАНИЕ ЗАПИСИ>',
          'children': [{
            'id': '<ИДЕНТИФИКАТОР ЗАПИСИ>',
             'name': '<НАЗВАНИЕ ЗАПИСИ>'
          }]
      }]
  }]
}
```
