cmake_minimum_required(VERSION 3.15)
project(vector_qsort LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Highway configuration
set(HWY_ENABLE_TESTS OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_EXAMPLES OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_CONTRIB ON CACHE BOOL "" FORCE)

if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/vendor/highway/CMakeLists.txt")
  add_subdirectory(vendor/highway EXCLUDE_FROM_ALL)
else()
  include(FetchContent)
  FetchContent_Declare(
    highway
    GIT_REPOSITORY https://github.com/google/highway.git
    GIT_TAG master
    GIT_SHALLOW TRUE
  )
  FetchContent_MakeAvailable(highway)
endif()

# Core C++ header directory
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/core")

# Node-API Target (when compiled with cmake-js)
if(DEFINED CMAKE_JS_INC)
  include_directories(${CMAKE_JS_INC})

  execute_process(
    COMMAND node -p "require('node-addon-api').include_dir"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
    OUTPUT_STRIP_TRAILING_WHITESPACE
  )
  include_directories(${NODE_ADDON_API_DIR})

  add_library(vector_qsort SHARED
    node/binding.cc
    ${CMAKE_JS_SRC}
  )

  set_target_properties(vector_qsort PROPERTIES
    PREFIX ""
    SUFFIX ".node"
  )

  target_link_libraries(vector_qsort PRIVATE
    ${CMAKE_JS_LIB}
    hwy
    hwy_contrib
  )

  target_compile_definitions(vector_qsort PRIVATE
    NAPI_DISABLE_CPP_EXCEPTIONS
    NAPI_VERSION=8
  )
endif()

# Python nanobind Target (when building Python wheel / extension)
find_package(Python 3.9 COMPONENTS Interpreter Development.Module QUIET)
if(Python_FOUND)
  find_package(nanobind CONFIG QUIET)
  if(nanobind_FOUND)
    nanobind_add_module(_vector_qsort
      python/binding.cc
    )
    target_link_libraries(_vector_qsort PRIVATE
      hwy
      hwy_contrib
    )
    install(TARGETS _vector_qsort LIBRARY DESTINATION vector_qsort)
  endif()
endif()
