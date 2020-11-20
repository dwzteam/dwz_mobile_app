/**
 * Created by zhanghuihua on 2017/11/9.
 */

(function($) {
    $.fn.extend({
        dropdown: function(options) {
            var op = $.extend({ toggle$: '.dropdown-toggle > span', menu$: 'ul.dropdown-menu > li', toggleClass: 'open' }, options);
            return this.each(function() {
                var $self = $(this),
                    $toggle = $self.find(op.toggle$),
                    $menus = $self.find(op.menu$);

                $self.touchwipe({
                    touch: function() {
                        $self.toggleClass(op.toggleClass);
                    }
                });


                $menus.touchwipe({
                    touch: function() {
                        var $menu = $(this);
                        var value = $menu.attr('data-value'),
                            name = $menu.text();
                        $self.data('value', value);
                        $toggle.text(name);

                        $self.trigger('change', { value: value, name: name });
                    }
                });

            });
        }
    });
})(dwz);