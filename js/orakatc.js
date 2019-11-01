jQuery(document).ready(function($) {
	"use strict";

	$(".single_add_to_cart_button, .add_to_cart_button").on("click", function() {
        var car_btn = $(this);
        var info_car = $(this).html();


		$(this).html('<li class="cart_add_but_load fa fa-spinner fa-pulse"></li>')

		var add_to_cart_id = $(this).val();
		var cart_addition = '';
		if(parseInt(add_to_cart_id) > 0) {
			cart_addition = "add-to-cart="+add_to_cart_id;
		}
		if($(this).hasClass('product_type_variable'))
		{
            $(this).html(info_car);
			return true;
        }

        if(parseInt(jQuery.data(document.body, "processing")) == 1)
        {
            $(this).html(info_car);
			return false;
        }
		jQuery.data(document.body, "processing", 1);

		var context = this;
		var product_id_Val;
		var quantity_Val;
		var variation_data = '';


		if ($(".variations_form").length) {

			variation_data = "variation_id="+$("input[name='variation_id']").val();

			var attrs = {};
			var variation_form = $('.variations_form');

			if($(variation_form).find('select[name^=attribute]').length) {
				$(variation_form).find('select[name^=attribute]').each(function() {
					var name = $(this).attr("name");
					var value = $(this).val();
					attrs[name] = value;
				});
			} else {
				$(variation_form).find('input[name^=attribute]').each(function() {
					attrs[$(this).attr("name")] = $(this).val();
				});
			}

			for(var entry in attrs) {
				variation_data += "&attribute["+entry+"]="+attrs[entry];
			}
		}

		if($(this).hasClass('single_add_to_cart_button')) {
			product_id_Val = $("input[name='add-to-cart']").val();
			quantity_Val = $("input[name='quantity']").val();
		} else {
			product_id_Val = $(this).attr('data-product_id');
			quantity_Val = $(this).attr('data-quantity');
			variation_data = '';
		}

		if(typeof quantity_Val == 'undefined') {
			quantity_Val = 1;
		}


		if($(context).hasClass('single_add_to_cart_button') && typeof use_product_grabber_2 != 'undefined' && use_product_grabber_2 == 1)
		{
			var form = $(this).closest('form');

			$.ajax( {
				type: "POST",
				url: form.attr( 'action' ),
				data: cart_addition + "&"+form.serialize(),
				success: function( response )
				{
					if($(response).find('.woocommerce-error').length > 0)
					{
						alert($(response).find('.woocommerce-error').text().trim());
						jQuery.data(document.body, "processing", 0);
					}
					else
					{
						if($(context).hasClass('single_add_to_cart_button'))
						{
							if(typeof use_default_gallery_image != 'undefined' && use_default_gallery_image == 1) {
								LetsFly($(gallery_image_selector), context);
							} else {
								LetsFly($('.attachment-shop_single'), context);
							}
						} else {
							LetsFly($(context).parents('li').find('img'), context);
						}

					}
                    jQuery.data(document.body, "processing", 0);
                    $(car_btn).html(info_car);
				}
			} );
		}
		else
		{

			$.post(site_url+ "/wp-admin/admin-ajax.php",
				"action=orak_add_to_cart&product_id="+product_id_Val+"&quantity="+quantity_Val+"&"+variation_data

			).done(function( data ) {
				if($(context).hasClass('single_add_to_cart_button'))
				{
					if(typeof use_default_gallery_image != 'undefined' && use_default_gallery_image == 1) {
						LetsFly($(gallery_image_selector), context);
					} else {
						LetsFly($('.attachment-shop_single'), context);
					}
				} else {
					LetsFly($(context).parents('li').find('.yjz-product-img-wrap'), context);
				}
                $(car_btn).html(info_car);
                jQuery.data(document.body, "processing", 0);
			});
		}

		return false;
	});

	function LetsFly(imageToDrag, context)
	{
		var scrollMillis = flying_speed;
		var scrollTop = $("html, body").scrollTop();

		if(scrollTop > 500 && scrollTop < 1000) {
			scrollMillis = scrollTop;
		} else {
			scrollMillis = parseInt(flying_speed)-(parseInt(flying_speed)*0.2);
		}

		if(typeof scroll_on_add != 'undefined' && scroll_on_add == 1) {
			$('html, body').animate({
				scrollTop: 0
			}, scrollMillis);
		}

		var defEq = parseInt(element_num)-1;

		var cart;
		var imgtodrag = $(imageToDrag);

		if(typeof use_default_selector != 'undefined' && use_default_selector == 1) {
			cart = $('a[href="'+cart_url+'"]:eq('+defEq+')');
		} else {
			cart = $(custom_selector+':eq('+defEq+')');
		}
		cart = $(".yjzan-menu-cart__wrapper i")[0];

		if (imgtodrag)
		{

			if(typeof use_woocommerce_widget != 'undefined' && use_woocommerce_widget == 1) {
				var $supports_html5_storage = ( 'sessionStorage' in window && window['sessionStorage'] !== null );
				var $fragment_refresh = {
					url: woocommerce_params.ajax_url,
					type: 'POST',
					data: { action: 'woocommerce_get_refreshed_fragments' },
					success: function( data ) {
						if ( data && data.fragments ) {

							$.each( data.fragments, function( key, value ) {
								$(key).replaceWith(value);
							});

							if ( $supports_html5_storage ) {
								sessionStorage.setItem( "wc_fragments", JSON.stringify( data.fragments ) );
								sessionStorage.setItem( "wc_cart_hash", data.cart_hash );
							}

							$('body').trigger( 'wc_fragments_refreshed' );
						}
					}
				};

				$.ajax($fragment_refresh);
			}
		}
	}
});