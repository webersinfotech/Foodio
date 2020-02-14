/*** Add Switcher */
function addSwitcher()
{
	var dzSwitcher = '<div class="styleswitcher-right"><div id="selectLanguageDropdown" class="localizationTool"></div><div class="styleswitcher-inner"><div class="switcher-btn-bx"><a class="switch-btn closed menu"><img src="images/switch.png" alt=""/></a></div><div class="switch-demo-bx"><ul class="switch-demo"><li> <a class="" href="index.html"> <img src="images/demo/index1.jpg" alt=""> </a></li><li> <a href="index-2.html"> <img src="images/demo/index2.jpg" alt=""> </a></li><li> <a href="index-3.html"> <img src="images/demo/index3.jpg" alt=""> </a></li><li> <a href="index-4.html"> <img src="images/demo/index4.jpg" alt=""> </a></li><li> <a href="index-5.html"> <img src="images/demo/index5.jpg" alt=""> </a></li><li> <a href="index-6.html"> <img src="images/demo/index6.jpg" alt=""> </a></li><li> <a href="index-7.html"> <img src="images/demo/index7.jpg" alt=""> </a></li><li> <a href="index-8.html"> <img src="images/demo/index8.jpg" alt=""> </a></li><li> <a href="index-9.html"> <img src="images/demo/index9.jpg" alt=""> </a></li><li> <a href="index-10.html"> <img src="images/demo/index10.jpg" alt=""> </a></li><li> <a href="index-11.html"> <img src="images/demo/index11.jpg" alt=""> </a></li><li> <a href="index-12.html"> <img src="images/demo/index12.jpg" alt=""> </a></li><li> <a href="index-13.html"> <img src="images/demo/index13.jpg" alt=""> </a></li><li> <a href="index-14.html"> <img src="images/demo/index14.jpg" alt=""> </a></li><li> <a href="index-15.html"> <img src="images/demo/index15.jpg" alt=""> </a></li><li> <a href="index-16.html"> <img src="images/demo/index16.jpg" alt=""> </a></li><li> <a href="index-17.html"> <img src="images/demo/index17.jpg" alt=""> </a></li></ul></div></div></div>';
	
	if($("#dzSwitcher").length == 0) {
		jQuery('body').append(dzSwitcher);
	}
}

jQuery(window).on('load',function(){
	//=== Switcher panal slide function	=====================//
	jQuery('.styleswitcher-right').animate({
		'right': '-100%',
		'left': 'auto'
	});
	jQuery('.switch-btn').addClass('closed');
	//=== Switcher panal slide function END	=====================//
	
	handleLanguageTranslation();
});
	
$(function(){		
	"use strict";
	
	addSwitcher();
	
	//=== Switcher panal slide function	=====================//
	jQuery('.switch-btn').on('click',function () {
		jQuery('.styleswitcher-right').toggleClass('active');
		if (jQuery(this).hasClass('open')) {
			jQuery(this).addClass('closed').removeClass('open');
			jQuery('.styleswitcher-right').animate({
				'right': '-100%',
			},200);
		} else {
			if (jQuery(this).hasClass('closed')) {
				jQuery(this).addClass('open').removeClass('closed');
				jQuery('.styleswitcher-right').animate({
					'right': '-0',
				},200);
			}
		}	
	});
	//=== Switcher panal slide function END	=====================//
});