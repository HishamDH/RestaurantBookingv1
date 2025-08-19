$(function () {
    const isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
    const commonDatePickerOptions = {
      singleDatePicker: true, 
      autoUpdateInput: false,
      opens: isArabic ? 'left' : 'right',
      locale: {
        format: 'DD/MM/YYYY',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'],
        firstDay: 0
      }
    };

    $('#datePicker').daterangepicker(commonDatePickerOptions, function(start) {
      $('#datePicker').val(start.format('DD/MM/YYYY'));
    }).on('show.daterangepicker', function () {
      if (!$(this).val()) $(this).val(moment().format('DD/MM/YYYY'));
    });
  });