from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize the response format
        custom_data = {
            'status': 'error',
            'message': 'Xatolik yuz berdi', # Default generic message in Uzbek
            'code': getattr(exc, 'default_code', 'error'),
            'errors': response.data
        }

        # If data is a dict and has 'detail', use it as the main message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_data['message'] = response.data['detail']
            elif 'non_field_errors' in response.data:
                custom_data['message'] = response.data['non_field_errors'][0]
            elif response.data:
                # Use first field error if available
                first_key = next(iter(response.data))
                if isinstance(response.data[first_key], list):
                    custom_data['message'] = f"{first_key}: {response.data[first_key][0]}"
        
        response.data = custom_data

    return response
