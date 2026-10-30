#!/usr/bin/env ruby
#
# 포스트의 마지막 수정일(last_modified_at)을 git 기록에서 가져온다.
# 카테고리·태그 정리처럼 front matter 메타 정보만 바꾼 커밋은 글이 수정된 게
# 아니므로 건너뛴다. 그래야 일괄 정리 후에도 "Recently Updated"가 오염되지 않는다.

META_ONLY_LINE = /\A[-+](categories|tags|mermaid|math|pin):/

def meta_only_commit?(sha, path)
  diff = `git show --format= -U0 --no-color #{sha} -- "#{path}"`
  changed = diff.lines.select { |l| l.start_with?('+', '-') && !l.start_with?('+++', '---') }
  changed.all? { |l| l.match?(META_ONLY_LINE) }
end

Jekyll::Hooks.register :posts, :post_init do |post|
  # 최신 커밋부터: "<sha>\t<date>"
  commits = `git log --format="%H%x09%ad" --date=iso -- "#{post.path}"`.lines.map { |l| l.chomp.split("\t", 2) }

  # 맨 마지막(가장 오래된) 커밋은 글을 만든 커밋이므로 수정으로 치지 않는다
  commits[0...-1].to_a.each do |sha, date|
    next if meta_only_commit?(sha, post.path)

    post.data['last_modified_at'] = date
    break
  end
end
