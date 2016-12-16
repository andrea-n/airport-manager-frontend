$(document).ready(function ($) {

	$('.btn-update').each(function() {
		$(this).on('click', function() {
			var form = $('#update');

			if(form.length>0) {
				if(!form.hasClass('active')) {
					form.fadeIn('fast');
					form.addClass('active');
				}

				var row = $(this).closest('tr'),
					columns = row.find('td');
				columns.each(function() {
					var name = $(this).data('name'),
						input = form.find('#' + name);
					if(input.length > 0) {
						input.val($(this).text().trim());
					}
				});
			}
		});
	});

	$('.btn-cancel').each(function() {
		$(this).on('click', function() {
			var form = $(this).closest('form');
			form.find(".form-control").val("");
			$(this).closest('.hidden').fadeOut('fast').removeClass('active');
		});
	});

	//js validation
	initJsValidation();

	// auto-populate
	$('form[data-populate]').each(function () {
		$(this).values();
	});

});

//submit form via JS, allows injection or change of values
$.fn.submitForm = function (toInject) {
	if (typeof toInject === 'object') {
		for (var key in toInject) {
			//change a value if element exits
			if ($("input[name='" + key + "']", this).length > 0) {
				$("input[name='" + key + "']", this).val(toInject[key]);
			} else {//or insert a new one if it doesn't
				if (toInject.hasOwnProperty(key)) {
					$('<input>').attr({
						type: 'hidden',
						id: key,
						name: key,
						value: toInject[key]
					}).appendTo(this);
				}
			}
		}
	}

	$(this).submit();
};

/* jQuery.values: get or set all of the name/value pairs from child input controls
 * @argument data {array} If included, will populate all child controls.
 * @argument inputPrefix {string} If included, will prefix all inputs and uppercase the first char
 * @returns element if data was provided, or array of values if not
 */
$.fn.values = function (data, inputPrefix) {
	var els = $(this).find(':input').get();

	//if data and inputPrefix are not passed we try to read them from the data-populate and data-populate-prefix attributes
	if (typeof data != 'undefined') {
		if (typeof data != 'object') {
			data = JSON.parse(data);
		}
	} else {
		var dataAttr = $(this).attr('data-populate');
		if (typeof dataAttr != "undefined") {
			data = JSON.parse(dataAttr);
			if (typeof data != 'object') {
				data = JSON.parse(data);
			}
		}
	}
	if (typeof inputPrefix == 'undefined') {
		inputPrefix = $(this).attr('data-populate-prefix');
	}

	if (typeof data == 'undefined') {
		// return all data
		data = {};

		$.each(els, function () {
			//var inputName = (typeof inputPrefix == 'string') ? (inputPrefix + this.name.charAt(0).toUpperCase() + this.name.slice(1)) : this.name;
			var multiCheckbox = (this.type == 'checkbox' && this.name.indexOf("[]") > -1);
			if (this.name && !this.disabled && (this.checked || /select|textarea/i.test(this.nodeName) || /text|hidden|password/i.test(this.type))) {
				if (multiCheckbox) {
					if (data[this.name] === undefined)
						data[this.name] = [];
					data[this.name].push($(this).val());
				} else {
					data[this.name] = $(this).val();
				}
			}
		});
		return data;
	} else {
		$.each(els, function () {
			var key = this.name;
			var isMultiCheckbox = (this.type == 'checkbox' && key.indexOf("[]") > -1);
			if (isMultiCheckbox) {
				key = key.replace("[]", '');
			}
			if (typeof inputPrefix == 'string') {
				key = key.replace(inputPrefix, '');
				key = key.charAt(0).toLowerCase() + key.slice(1);
			}
			if (this.name && data[key]) {
				if (isMultiCheckbox) {
					$(this).attr("checked", ($.inArray($(this).val(), data[key]) >= 0));
				} else if (this.type == 'checkbox' || this.type == 'radio') {
					$(this).attr("checked", (data[key] == $(this).val()));
				} else {
					$(this).val(data[key]);
				}
			}
		});
		return $(this);
	}
};

/*
 jQuery deparam is an extraction of the deparam method from Ben Alman's jQuery BBQ
 http://benalman.com/projects/jquery-bbq-plugin/
 */
(function ($) {
	$.deparam = function (params, coerce) {
		var obj = {},
				coerce_types = {'true': !0, 'false': !1, 'null': null};

		// Iterate over all name=value pairs.
		$.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
			var param = v.split('='),
					key = decodeURIComponent(param[0]),
					val,
					cur = obj,
					i = 0,
					// If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
					// into its component parts.
					keys = key.split(']['),
					keys_last = keys.length - 1;

			// If the first keys part contains [ and the last ends with ], then []
			// are correctly balanced.
			if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
				// Remove the trailing ] from the last keys part.
				keys[keys_last] = keys[keys_last].replace(/\]$/, '');

				// Split first keys part into two parts on the [ and add them back onto
				// the beginning of the keys array.
				keys = keys.shift().split('[').concat(keys);

				keys_last = keys.length - 1;
			} else {
				// Basic 'foo' style key.
				keys_last = 0;
			}

			// Are we dealing with a name=value pair, or just a name?
			if (param.length === 2) {
				val = decodeURIComponent(param[1]);

				// Coerce values.
				if (coerce) {
					val = val && !isNaN(val) ? +val              // number
							: val === 'undefined' ? undefined         // undefined
							: coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
							: val;                                                // string
				}

				if (keys_last) {
					// Complex key, build deep object structure based on a few rules:
					// * The 'cur' pointer starts at the object top-level.
					// * [] = array push (n is set to array length), [n] = array if n is
					//   numeric, otherwise object.
					// * If at the last keys part, set the value.
					// * For each keys part, if the current level is undefined create an
					//   object or array based on the type of the next keys part.
					// * Move the 'cur' pointer to the next level.
					// * Rinse & repeat.
					for (; i <= keys_last; i++) {
						key = keys[i] === '' ? cur.length : keys[i];
						cur = cur[key] = (i < keys_last) ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
					}

				} else {
					// Simple key, even simpler rules, since only scalars and shallow
					// arrays are allowed.

					if ($.isArray(obj[key])) {
						// val is already an array, so push on the next value.
						obj[key].push(val);

					} else if (obj[key] !== undefined) {
						// val isn't an array, but since a second value has been specified,
						// convert val into an array.
						obj[key] = [obj[key], val];

					} else {
						// val is a scalar.
						obj[key] = val;
					}
				}

			} else if (key) {
				// No value was defined, so set something meaningful.
				obj[key] = coerce ? undefined : '';
			}
		});

		return obj;
	};
})(jQuery);

//initializes validate.js rules from Zend backend validation rules in data attributes
function initJsValidation()
{
	$('form').each(function () {
		if ($(this).attr('data-validation-initialized'))
			return;

		if ($(this).attr('data-js-validation')) {
			var messages = {};
			var errorWrapperSelector = $(this).attr('data-error-wrapper-selector');
			var errorWrapperClass = $(this).attr('data-error-wrapper-class');
			var errorClassOnElement = $(this).attr('data-error-class-on-element');
			$('input[data-error-messages], textarea[data-error-messages], checkbox[data-error-messages], select[data-error-messages]', this).each(function () {
				messages[$(this).attr('name')] = JSON.parse($(this).attr('data-error-messages'));
			});
			//additional rules
			var rules = {};
			$('*', this).filter(':input').each(function () {
				var i = 0;
				if (!$(this).attr('id'))
					return;
				var depends = $(this).attr('depends');
				if (depends !== undefined)
					depends = JSON.parse(depends);
				else
					return;

				var dependentValSelectors = [];
				if (!Array.isArray(depends.key))
					depends.key = [depends.key];

				for (i in depends.key) {
					var key = depends.key[i];
					var dependentElement = $('*[name="' + key + '"]');
					var dependentValSelector = (dependentElement.attr('type') == 'radio') ? 'input[name="' + key + '"]:checked' : '#' + key;
					dependentValSelectors.push(dependentValSelector);
				}
				var elementId = $(this).attr('id');
				rules[elementId] = {
					required: {
						depends: function () {
							for (i in dependentValSelectors) {
								if ($(dependentValSelectors[i]).val() == depends.value)
									return true;
							}
							return false;
						}
					}
				};
				if (depends.hasOwnProperty('additionalValidators')) {
					for (i in depends.additionalValidators) {
						rules[elementId][i] = depends.additionalValidators[i];
					}
				}
			});
			$(this).validate({
				'errorClass': $(this).attr('data-error-class'),
				'errorElement': $(this).attr('data-error-element'),
				errorPlacement: function (error, element) {
					$('.error-placement-wrapper[data-element-id=' + element.attr('id') + ']').html(error);
				},
				highlight: function (element) {
					if (errorWrapperSelector && errorWrapperClass) {
						$(element).closest(errorWrapperSelector).addClass(errorWrapperClass);
					}
					if (errorClassOnElement) {
						$(element).addClass(errorClassOnElement);
					}
				},
				unhighlight: function (element) {
					if (errorWrapperSelector && errorWrapperClass) {
						$(element).closest(errorWrapperSelector).removeClass(errorWrapperClass);
					}
					$('.error-placement-wrapper[data-element-id=' + element.id + ']').empty();
					if (errorClassOnElement) {
						$(element).removeClass(errorClassOnElement);
					}
				},
				'messages': messages,
				rules: rules,
				submitHandler: function (form) {
					//prevent multiple form submissions
					if (!$(form).attr('data-form-submitted') || $(this).attr('data-allow-multiple-submissions')) {
						$(form).attr('data-form-submitted', '1');
						if ($(form).hasClass('ajax')) {
							$(form).myAjax($(form).attr('data-to-inject'));
						} else {
							form.submit();
						}
					}
				}
			});
			$(this).attr('data-validation-initialized', '1');
		} else {
			//prevent multiple form submissions on no-js-validated forms
			if (!$(this).hasClass('ajax') && !$(this).attr('data-allow-multiple-submissions')) {
				$(this).submit(function () {
					if (!$(this).attr('data-form-submitted')) {
						$(this).attr('data-form-submitted', '1');
						this.submit();
						return true;
					} else {
						return false;
					}
				});
			}
		}
	});
}

//upload widget init functions
$.fn.updateUploadAddRemove = function () {
	if (!$('.part-optional:hidden', this).length) {
		$(".add-upload", this).hide();
	} else {
		$(".add-upload", this).show();
	}

	if (!$('.part-optional:visible', this).length) {
		$(".remove-upload", this).hide();
	} else {
		$(".remove-upload", this).show();
	}
};

function initUploadWidgets()
{
	//set up upload widget listeners
	$('body').on("change", ".upload-widget input[type=hidden][name^='edit_']", function () {
		if ($(this).val() == 1) {
			$(this).nextAll('.part-edit:first').hide();
			$(this).nextAll('.part-input:first').show();
		} else {
			$(this).nextAll('.part-input:first').hide();
			$(this).nextAll('.part-edit:first').show();
		}
	});
	$('body').on("click", ".upload-widget .edit-upload", function () {
		var edit_switch = $("input[type=hidden][name^='edit_']", $(this).closest(".upload-part"));
		edit_switch.val(1);
		edit_switch.change();
	});
	$('body').on('click', '.upload-widget .add-upload', function () {
		var widget = $(this).closest('.upload-widget');
		var first = $(".part-optional:hidden:first", widget);
		if (first.length > 0) {
			var edit_switch = $("input[type=hidden][name^='edit_']", first);
			edit_switch.val(1);
			edit_switch.change();
			var remove_switch = $("input[type=hidden][name^='remove_']", first);
			remove_switch.val(0);
			remove_switch.change();
			first.show();
			$('input[type=file]', first).click();
		}
		widget.updateUploadAddRemove();
	});
	$('body').on('click', '.upload-widget .remove-upload', function () {
		var widget = $(this).closest('.upload-widget');
		var last = $(".part-optional:visible:last", widget);
		if (last.length > 0) {
			last.hide();
			var edit_switch = $("input[type=hidden][name^='edit_']", last);
			edit_switch.val(0);
			edit_switch.change();
			var remove_switch = $("input[type=hidden][name^='remove_']", last);
			remove_switch.val(1);
			remove_switch.change();
			$("input[type=file]", last).val('');
		}
		widget.updateUploadAddRemove();
	});

	updateUploadWidgets();
}

function updateUploadWidgets()
{
	//form sections switches init
	$(".upload-widget input[type=hidden][name^='edit_']").each(function () {
		$(this).change();
	});
	$(".upload-widget").each(function () {
		$(this).updateUploadAddRemove();
	});
}
