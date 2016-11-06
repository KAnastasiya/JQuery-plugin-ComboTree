(function( $ ) {
  let methods = {
    // Инициализация плагина
    init: function(params) {
      return this.each(function() {
        // Формирование настроек плагина ('склеивание' внутренних и внешних настроек)
        let config = { slideDur: 400 };
        let options = $.extend({}, config, params);

        // Связывание настроек с их владельцем - соответствующем DOM-элементом
        let $this = $(this);
        for(let key in options) {
          $this.data(key, options[key]);
        }

        // Отрисовка поля поиска и иконки раскрытия списка вариантов
        $( $this.data('element') ).addClass('combotree');
        methods.renderField($this);

        // Навешивание обработчиков событий
        $(document).bind('mouseup', methods.onWindowMouseUp);

        // Создание кастомного css-селектора, который будет использоваться для поиска по списку
        $.extend($.expr[':'], {
          containsIN: function(elem, i, match) {
            return (elem.innerText || '').toLowerCase().indexOf((match[3] || '').toLowerCase()) >= 0;
          }
        });
      });
    },

    /**
     * Отрисовка поля ввода
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    renderField: function(element) {
      // Если название поля задано, то отрисовуется соответствующий элемент
      if( element.data('label') ) {
        $('<label class="combotree__label" for="combotree__search">' + element.data('label')  + '</label>').appendTo( $( element.data('element') ) );
      }

      // Контейнер для поля ввода и кнопки раскрытия списка вариантов
      let inputContainer = $('<div class="combotree__field"></div>').appendTo( $( element.data('element') ) );
      if( !element.data('label') ) {
        inputContainer.addClass('without-label');
      }

      // Поле ввода
      let placeholder = element.data('placeholder') || '';
      let input = $('<input id="combotree__input" class="combotree__input" type="search" placeholder="' + placeholder + '">')
      .appendTo(inputContainer)
      .bind('keyup', methods.onInputChange);

      // Кнопка открытия списка вариантов
      $('<button class="combotree__btn" type="button">')
      .appendTo(inputContainer)
      .bind('click', methods.onSelectClick);

      // Контейнер для списка вариантов
      let listMaxHeight = element.data('listHeight') || '240';
      let wrapper = $('<div class="combotree__list-wrapper"></div>').appendTo( $( element.data('element') ) );
      wrapper.css('max-height', listMaxHeight + 'px');

      // Проставление значения по умолчанию
      if( element.data('value') ) {
        let defaultValue = methods.findDefaultItem( element.data('data').children, element.data('value') );
        input.val( defaultValue.name );
      }
    },

    /**
     * Отрисовка содержимого выпадающего списка
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    renderList: function(element) {
      methods.renderNodes( element.data('data').children, element.find('.combotree__list-wrapper'));
    },

    /**
     * Рекурсивная функция, формирующая и отрисовующая содержимое выпадающего списка
     * @param {Array}   childrenDataObj Информация о вариантах списка
     * @param {Element} parentElement   DOM-элемент родителя варианта списка
     */
    renderNodes: function(childrenDataObj, parentElement) {
      if(childrenDataObj) {
        // Отрисовка контейнера для вариантов списка
        let childContainer = $('<ul class="combotree__list"></ul>');
        childContainer.appendTo(parentElement);
        // Сортировка вариантов списка
        childrenDataObj.sort(function(a, b) {
          let compA = a.name.toUpperCase();
          let compB = b.name.toUpperCase();
          return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });
        // Отрисовка вариантов списка
        childrenDataObj.forEach(function(child) {
          parentElement = methods.renderItem(child.name, childContainer, !child.children);
          methods.renderNodes(child.children, parentElement);
        });
      }
    },

    /**
     * Отрисовка элемента списка
     * @param  {String}   name        Название элемента
     * @param  {Element}  parent      DOM-элемент родителя элемента списка
     * @param  {Boolean}  isLastLevel Признак того, что элемент является нижним уровнем в иерархии списка
     * @return {Element}  itemElement DOM-элемент варианта списка
     */
    renderItem: function(name, parent, isLastLevel) {
      let lastLevelClass = isLastLevel ? 'combotree__item_last-level' : '';
      let itemElement = $('<li class="combotree__item ' + lastLevelClass + '">' + name + '</li>' );
      itemElement.appendTo(parent);
      return itemElement;
    },

    /**
     * Раскрытие выпадающего списка
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    showList: function(element) {
      // Вычисление нижней позиции элемента
      let listMaxHeight = element.data('listHeight') || '240';
      let elementBottomPos = element.offset().top + element.height() + +listMaxHeight;

      if(elementBottomPos < $(window).height()) {
        // Если элемент может быть развернут вниз (места хватает), то он разворачивается вниз
        element.find('.combotree__list-wrapper').slideDown( element.data('slideDur') ).bind('click', methods.onItemClick);
      } else {
        // Если места для раскрытия элемента вниз недостаточно, то он раскрывается вверх
        element.find('.combotree__list-wrapper').addClass('openToTop').slideDown( element.data('slideDur') ).bind('click', methods.onItemClick);
      }

      // Отрисовка списка вариантов
      methods.renderList(element);

      // Если поле ввода заполнено, то соответствующее значение подсвечивается в списке вариантов
      let inputValue = element.find('.combotree__input').val();
      if(inputValue !== '') {
        methods.searchItem(inputValue, element);
      }

      // Открытие раскрывающегося списка
      element.addClass('open');
    },

    /**
     * Сворачивание выпадающего списка
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    hideList: function(element) {
      element.find('.combotree__list-wrapper').slideUp( element.data('slideDur') ).unbind('click', methods.onItemClick);
      element.find('.combotree__list-wrapper').children().removeClass('open').removeClass('hidden');

      setTimeout(function() {
        element.removeClass('open');
        element.find('.combotree__list-wrapper').removeClass('openToTop').children().remove();
      }, 550);
    },

     /**
     * Поиск в списке вариантов, удовлетворяющим введенным условиям
     * @param {String}  searchCondition Условие поиска
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    searchItem: function(searchCondition, element) {
      // Поиск в списке вариантов, удовлетворяющих введенным условиям
      element.find('.combotree__item_last-level:containsIN("' + searchCondition + '")').addClass('search-result');

      // Раскрытие всех родителей для вариантов, удовлетворяющих условиям поиска
      element.find('.search-result').each(function() {
        let allParentsItem = $(this).parents('.combotree__item');
        allParentsItem.each(function() {
          $(this).addClass('open');
        });

        let allParentsList = $(this).parents('.combotree__list');
        allParentsList.each(function() {
          $(this).addClass('open');
        });
      });
    },

    /**
     * Поиск значения по умолчанию
     * @param  {Array}  childrenData   Информация о вариантах списка
     * @param  {String} defaultValueId ID значения по умолчанию
     * @return
     */
    findDefaultItem: function(childrenData, defaultValueId) {
      for(let i = 0; i < childrenData.length; i++) {
        if(childrenData[i].id === defaultValueId) {
          return childrenData[i];
        }

        if(childrenData[i].children) {
          let res = methods.findDefaultItem(childrenData[i].children, defaultValueId);
          if(res) {
            return res;
          }
        }
      }

      return null;
    },

    /**
     * Отображение сообщения об отсутствии вариантов, удовлетворяющих условиям поиска
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    showListNoResultText: function(element) {
      if( element.find('.combotree__list-wrapper').children().hasClass('hidden') && !element.find('.combotree__search_no-result').length ) {
        $('<p class="combotree__search_no-result">Ничего не найдено</p>').appendTo( element.find('.combotree__list-wrapper') );
      }
    },

    /**
     * Скрытие вариантов, которые условиям не удовлетворяют, а также пустых 'родителей'
     * @param {Element} element DOM-элемент, который нужно скрыть
     */
    hideListOptionsNotComplySearchConditions: function(element) {
      // Скрытие тех вариантов, которые условиям не удовлетворяют
      element.find('.combotree__item_last-level').each(function() {
        if( !$(this).hasClass('search-result') ) {
          $(this).addClass('hidden');
        }
      });

      // Скрытие пустых родителей
      element.find('.combotree__list').each(function() {
        methods.hideListEmptyParents( $(this) );
      });

      element.find('.combotree__item').not('.combotree__item_last-level').each(function() {
        methods.hideListEmptyParents( $(this) );
      });
    },

    /**
     * Скрытие пустых элементов неконечного уровня
     * @param {Element} element DOM-элемент, который нужно скрыть
     */
    hideListEmptyParents: function(element) {
      let hasShowListedItem = false;
      let lastLevel = element.find('.combotree__item_last-level');
      lastLevel.each(function() {
        if( $(this).hasClass('search-result') ) {
          hasShowListedItem = true;
          return false;
        }
      });

      if(!hasShowListedItem) {
        element.removeClass('open').addClass('hidden');
      }
    },

    /**
     * Сброс результатов поиска
     * @param {Element} element DOM-элемент элемента, для которого вызывается плагин
     */
    resetSearchResult: function(element) {
      element.find('.combotree__list').removeClass('hidden');
      element.find('.combotree__item').removeClass('hidden');
      element.find('.combotree__item_last-level').removeClass('search-result');
      element.find('.combotree__search_no-result').remove();
    },

    /**
     * Обработчик события изменения значения поля ввода
     * @param {Object} event
     */
    onInputChange: function(event) {
      let $input = $(event.target);
      let $combotree = $(event.target).parents('.combotree');
      if ($input.val().length === 0) {
        // Условие поиска не введено
        if( $combotree.hasClass('open') ) {
          methods.resetSearchResult($combotree);
        }
      } else {
        // Условие поиска введено
        if( $combotree.hasClass('open') ) {
          // Список вариантов раскрыт
          methods.resetSearchResult($combotree);
          methods.searchItem($input.val(), $combotree);
          methods.hideListOptionsNotComplySearchConditions($combotree);
          methods.showListNoResultText($combotree);
        } else {
          // Список вариантов свернут
          methods.showList($combotree);
          methods.searchItem($input.val(), $combotree);
          methods.hideListOptionsNotComplySearchConditions($combotree);
          methods.showListNoResultText($combotree);
        }
      }
    },

    /**
     * Обработчик события нажатия на кнопку раскрытия выпадающего списка
     * @param {Object} event
     */
    onSelectClick: function(event) {
      event.preventDefault();
      let $combotree = $(event.target).parents('.combotree');
      if( $combotree.hasClass('open') ) {
        // Список вариантов развернут
        methods.hideList($combotree);
      } else {
        // Список вариантов свернут
        methods.showList($combotree);
      }
    },

    /**
     * Обработчик события нажатия на элемент списка
     * @param {Object} event
     */
    onItemClick: function(event) {
      event.stopPropagation();
      let $item = $(event.target);
      let $combotree = $item.parents('.combotree');
      if($item.hasClass('combotree__item')) {
        // Нажат элемент списка
        if($item.hasClass('combotree__item_last-level')) {
          // Нажат элемент последнего уровня
          $combotree.find('.combotree__input').val($item.text());
          methods.hideList($combotree);
        } else {
          // Нажат элемент не последнего уровня
          event.stopPropagation();
          if($item.hasClass('open')) {
            // Элемент развернут
            $item.children().slideUp( $combotree.data('slideDur') );
            setTimeout(function() {
              $item.removeClass('open');
            }, 400);
          } else {
            // Элемент свернут
            $item.children().slideDown( $combotree.data('slideDur') );
            $item.addClass('open');
          }
        }
      }
    },

    /**
     * Обработчик события щелчка мышью в любой месте экрана, кроме области combotree
     * @param {Object} event
     */
    onWindowMouseUp: function(event) {
      if( $('.combotree.open').has(event.target).length === 0) {
        methods.hideList( $('.combotree.open') );
      }
    }
  };

  $.fn.combotree = function(settings) {
    return methods.init.apply(this, arguments);
  };
})(jQuery);
