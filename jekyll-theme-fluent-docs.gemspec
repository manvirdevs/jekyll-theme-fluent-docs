# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-fluent-docs"
  spec.version       = "0.1.0"
  spec.authors       = ["Manvir Singh"]
  spec.email         = ["jekyll-theme-fluent-docs@github.com"]
  spec.summary       = "Fluent UI based Jekyll theme for documentation sites."
  spec.homepage      = "https://github.com/manvirdevs/jekyll-theme-fluent-docs"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_data|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }

  spec.add_runtime_dependency "jekyll", ">=3.9", "<5.0"
  spec.add_runtime_dependency "jekyll-seo-tag", ">=2.6", "<3.0"
end
