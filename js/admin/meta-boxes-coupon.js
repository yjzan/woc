jQuery(function( $ ) {

    /**
     * Coupon actions
     */
    var wc_meta_boxes_coupon_actions = {

        /**
         * Initialize variations actions
         */
        init: function() {
            $( 'select#discount_type' )
                .on( 'change', this.type_options )
                .change();
        },

        /**
         * Show/hide fields by coupon type options
         */
        type_options: function() {
            // Get value
            var select_val = $( this ).val();

            if ( select_val !== 'fixed_cart' ) {
                $( '.limit_usage_to_x_items_field' ).show();
            } else {
                $( '.limit_usage_to_x_items_field' ).hide();
            }

           if(select_val == 'percent')
            {
                $( '.limit_usage_to_x_items_field' ).show();
                jQuery(".form-field.coupon_amount_field").find('label').html('优惠券百分比折扣（%）');
            }else if(select_val == 'fixed_cart'){
               $( '.limit_usage_to_x_items_field' ).hide();
               jQuery(".form-field.coupon_amount_field").find('label').html('优惠券金额');
           }else
           {
               $( '.limit_usage_to_x_items_field' ).show();
               jQuery(".form-field.coupon_amount_field").find('label').html('优惠券金额');
           }
        }
    };

    wc_meta_boxes_coupon_actions.init();
});
