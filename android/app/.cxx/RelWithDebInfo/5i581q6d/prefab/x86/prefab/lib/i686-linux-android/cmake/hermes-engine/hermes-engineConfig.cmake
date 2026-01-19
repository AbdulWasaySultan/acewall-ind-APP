if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/marianoor/.gradle/caches/8.13/transforms/e561a215717d620392217fceaffb1ff8/transformed/hermes-android-0.79.1-release/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/marianoor/.gradle/caches/8.13/transforms/e561a215717d620392217fceaffb1ff8/transformed/hermes-android-0.79.1-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

