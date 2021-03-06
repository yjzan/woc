/* global wc_cart_fragments_params, Cookies */
jQuery( function( $ ) {

    // wc_cart_fragments_params is required to continue, ensure the object exists
    if ( typeof wc_cart_fragments_params === 'undefined' ) {
        return false;
    }

    /* Storage Handling */
    var $supports_html5_storage = true,
        cart_hash_key           = wc_cart_fragments_params.cart_hash_key;

    try {
        $supports_html5_storage = ( 'sessionStorage' in window && window.sessionStorage !== null );
        window.sessionStorage.setItem( 'wc', 'test' );
        window.sessionStorage.removeItem( 'wc' );
        window.localStorage.setItem( 'wc', 'test' );
        window.localStorage.removeItem( 'wc' );
    } catch( err ) {
        $supports_html5_storage = false;
    }

    /* Cart session creation time to base expiration on */
    function set_cart_creation_timestamp() {
        if ( $supports_html5_storage ) {
            sessionStorage.setItem( 'wc_cart_created', ( new Date() ).getTime() );
        }
    }

    /** Set the cart hash in both session and local storage */
    function set_cart_hash( cart_hash ) {
        if ( $supports_html5_storage ) {
            localStorage.setItem( cart_hash_key, cart_hash );
            sessionStorage.setItem( cart_hash_key, cart_hash );
        }
    }

    /* Named callback for refreshing cart fragment */
    function refresh_cart_fragment() {
        var $fragment_refresh = {
            url: wc_cart_fragments_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'get_refreshed_fragments' ),
            type: 'POST',
            data: {
                time: new Date().getTime()
            },
            timeout: wc_cart_fragments_params.request_timeout,
            success: function( data ) {
                if ( data && data.fragments ) {

                    $.each( data.fragments, function( key, value ) {
                        $( key ).replaceWith( value );
                    });

                    if ( $supports_html5_storage ) {
                        sessionStorage.setItem( wc_cart_fragments_params.fragment_name, JSON.stringify( data.fragments ) );
                        set_cart_hash( data.cart_hash );

                        if ( data.cart_hash ) {
                            set_cart_creation_timestamp();
                        }
                    }

                    $( document.body ).trigger( 'wc_fragments_refreshed' );
                    quantity();
                }
            },
            error: function() {
                $( document.body ).trigger( 'wc_fragments_ajax_error' );
            }
        };
        $.ajax( $fragment_refresh );

    }

    jQuery(".remove-cart-item").on("click", function () {
        setCartItemQuantity(this,0);
        $(this).parent().parent().remove();
    });

    function quantity() {
        var _selector ='.variations_form.cart,.woocommerce-cart-form,.cart';

        var j_quick_view = jQuery(_selector),
            _qty = j_quick_view.find('.quantity');

        if (!_qty.length || jQuery(_qty).hasClass('hidden')) return;
        _qty.prepend('<span class=\'modify-qty\' data-click=\'minus\'>-</span>').append('<span class=\'modify-qty\' data-click=\'plus\'>+</span>');

        var _qty_btn = j_quick_view.find('.modify-qty');



        jQuery(_qty_btn).off('click').on('click', function () {

            cart_clicking++;
            var check_click_value = cart_clicking;

            var t = jQuery(this),
                _input = t.parent().find('input'),
                currVal = parseInt(_input.val(), 10),
                max = parseInt(_input.prop('max'));

            if ('minus' === t.attr('data-click') && currVal > 1) {
                _input.val(currVal - 1);
            }

            if ('plus' === t.attr('data-click')) {
                if (currVal >= max) return;
                _input.val(currVal + 1);
            }


            if(t.parent().hasClass('yjz-cart-item-input'))
            {
                var cart_item_price = parseInt(t.parent().attr('data-cart-price'));
                var amount = $('#yjz_cart_subtotal .woocommerce-Price-amount').html();
                amount = amount.split('</span>');
                amount[1] = parseFloat(amount[1].replace(/,/g,""));
                var new_price;
                var new_counter = parseInt($('.yjzan-button-icon').attr('data-counter'));
                if('plus' === t.attr('data-click'))
                {
                    new_price  =  amount[1] + cart_item_price;
                    new_counter = new_counter+1;
                }
                else
                {
                    if('minus' === t.attr('data-click') && currVal ==1 )
                    {
                        t.parent().parent().parent().hide();
                    }
                    new_price  =  amount[1] - cart_item_price;
                    new_counter = new_counter-1>0?(new_counter-1):0;

                }
                new_price = new_price.toFixed(2);

                $('#yjz_cart_subtotal .woocommerce-Price-amount').html(amount[0]+'</span>'+new_price);
                $('.yjzan-button-icon').attr('data-counter',new_counter);

            }

            setTimeout(function(){
                if(check_click_value==cart_clicking)
                    cart_clicking = 0;
            },300);

            setTimeout(function() {
                if (cart_clicking == 0 && t.parent().hasClass('yjz-cart-item-input'))
                {
                    var number = 'minus' === t.attr('data-click') && currVal ==1 ? 0:_input.val();
                    setCartItemQuantity(t.parent(),parseInt(number, 10));
                    cart_clicking=0;
                }
            },500);

            jQuery('[name=\'update_cart\']').prop('disabled', false);
        });
    };

    var cart_clicking=0;

    function yjzSendInfo(msg)
    {

        if($(".noticejs").length>0)
            return;

        new NoticeJs({
            text: msg,
            position: "topCenter",
            type:"success",
            progressBar:true,
            modal: false,
            timeout: 20,
            animation: {
                open: 0,
                close: 0
            }
        }).show();

    }

    function setCartItemQuantity(obj,item_num) {
        var item_key = $(obj).attr('data-cart-key');
        var variation_id= $(obj).attr('data-variation-id');
        var product_id= $(obj).attr('data-product-id');
        var iteem_price = $(obj).attr('data-cart-price');
        $.post(site_url+ "/wp-admin/admin-ajax.php",
            "action=set_cart_quantity&product_id="+product_id+"&quantity="+item_num+"&variation_id="+variation_id+"&cart_item_key="+item_key
        ).done(function( data ) {
            if (data.status==1) {
                if(item_num==0)
                    $(obj).parent().parent().remove();

                //修改金额总数
                var amount = $('#yjz_cart_subtotal .woocommerce-Price-amount').html();
                amount = amount.split('</span>');
                $('#yjz_cart_subtotal .woocommerce-Price-amount').html(amount[0]+'</span>'+data.subtotal);

                $('.yjzan-button-icon').attr('data-counter',data.item_quantity);
                if(data.item_quantity==0){
                    $('#yjz_cart_subtotal').hide();
                    $(".woocommerce-mini-cart__empty-message").show();
                    $(".yjzan-menu-cart__footer-buttons").hide();
                }else{
                    $(".yjzan-menu-cart__footer-buttons").show();
                }

                //存在父窗口同步更新父窗口的数据
                if(window.top!=window.self)
                {
                    var target = "[data-cart-key='"+item_key+"'].yjz-cart-item-input";
                    if(item_num==0)
                    {
                        $(obj,parent.document).parent().parent().remove();
                        $(target,parent.document).parent().parent().remove();
                    }
                    else
                    {
                        $(target,parent.document).find('.input-text').val(item_num);
                    }

                    $('#yjz_cart_subtotal .woocommerce-Price-amount',parent.document).html(amount[0]+'</span>'+data.subtotal);
                    $('.yjzan-button-icon',parent.document).attr('data-counter',data.item_quantity);
                    if(data.item_quantity==0){
                        $('#yjz_cart_subtotal',parent.document).hide();
                        $(".woocommerce-mini-cart__empty-message",parent.document).show();
                        $(".yjzan-menu-cart__footer-buttons").hide();
                    }else{
                        $(".yjzan-menu-cart__footer-buttons").show();
                    }

                }
            }

        });

    }

    /* Cart Handling */
    if ( $supports_html5_storage ) {

        var cart_timeout = null,
            day_in_ms    = ( 24 * 60 * 60 * 1000 );

        $( document.body ).on( 'wc_fragment_refresh updated_wc_div', function() {
            refresh_cart_fragment();
        });

        $( document.body ).on( 'added_to_cart removed_from_cart', function( event, fragments, cart_hash ) {
            var prev_cart_hash = sessionStorage.getItem( cart_hash_key );

            if ( prev_cart_hash === null || prev_cart_hash === undefined || prev_cart_hash === '' ) {
                set_cart_creation_timestamp();
            }

            sessionStorage.setItem( wc_cart_fragments_params.fragment_name, JSON.stringify( fragments ) );
            set_cart_hash( cart_hash );
        });

        $( document.body ).on( 'wc_fragments_refreshed', function() {
            clearTimeout( cart_timeout );
            cart_timeout = setTimeout( refresh_cart_fragment, day_in_ms );
        } );

        // Refresh when storage changes in another tab
        $( window ).on( 'storage onstorage', function ( e ) {
            if (
                cart_hash_key === e.originalEvent.key && localStorage.getItem( cart_hash_key ) !== sessionStorage.getItem( cart_hash_key )
            ) {
                refresh_cart_fragment();
            }
        });

        // Refresh when page is shown after back button (safari)
        $( window ).on( 'pageshow' , function( e ) {
            if ( e.originalEvent.persisted ) {
                $( '.widget_shopping_cart_content' ).empty();
                $( document.body ).trigger( 'wc_fragment_refresh' );
            }
        } );

        try {
            var wc_fragments = $.parseJSON( sessionStorage.getItem( wc_cart_fragments_params.fragment_name ) ),
                cart_hash    = sessionStorage.getItem( cart_hash_key ),
                cookie_hash  = Cookies.get( 'woocommerce_cart_hash'),
                cart_created = sessionStorage.getItem( 'wc_cart_created' );

            if ( cart_hash === null || cart_hash === undefined || cart_hash === '' ) {
                cart_hash = '';
            }

            if ( cookie_hash === null || cookie_hash === undefined || cookie_hash === '' ) {
                cookie_hash = '';
            }

            if ( cart_hash && ( cart_created === null || cart_created === undefined || cart_created === '' ) ) {
                throw 'No cart_created';
            }

            if ( cart_created ) {
                var cart_expiration = ( ( 1 * cart_created ) + day_in_ms ),
                    timestamp_now   = ( new Date() ).getTime();
                if ( cart_expiration < timestamp_now ) {
                    throw 'Fragment expired';
                }
                cart_timeout = setTimeout( refresh_cart_fragment, ( cart_expiration - timestamp_now ) );
            }

            if ( wc_fragments && wc_fragments['div.widget_shopping_cart_content'] && cart_hash === cookie_hash ) {

                $.each( wc_fragments, function( key, value ) {
                    $( key ).replaceWith(value);
                });

                $( document.body ).trigger( 'wc_fragments_loaded' );
            } else {
                throw 'No fragment';
            }

        } catch( err ) {
            refresh_cart_fragment();
        }

    } else {
        refresh_cart_fragment();
    }

    /* Cart Hiding */
    if ( Cookies.get( 'woocommerce_items_in_cart' ) > 0 ) {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).show();
    } else {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).hide();
    }

    $( document.body ).on( 'adding_to_cart', function() {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).show();
    });

    // Customiser support.
    var hasSelectiveRefresh = (
        'undefined' !== typeof wp &&
        wp.customize &&
        wp.customize.selectiveRefresh &&
        wp.customize.widgetsPreview &&
        wp.customize.widgetsPreview.WidgetPartial
    );
    if ( hasSelectiveRefresh ) {
        wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function() {
            refresh_cart_fragment();
        } );
    }

});
