require "pagy/extras/overflow"

# A page past the end (e.g. after the last item on it was withdrawn) returns
# the last page instead of an error.
Pagy::DEFAULT[:overflow] = :last_page
